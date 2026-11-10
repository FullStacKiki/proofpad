use serde::Serialize;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Instant;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CompileResult {
    ok: bool,
    pdf_path: Option<String>,
    /// stdout + stderr of Tectonic
    output: String,
    /// contents of the TeX .log file, when kept
    log: String,
    duration_ms: u64,
}

/// GUI apps launched from Finder do not inherit the shell PATH, so check the
/// usual Homebrew locations first.
fn find_tectonic() -> Option<PathBuf> {
    for p in ["/opt/homebrew/bin/tectonic", "/usr/local/bin/tectonic"] {
        if Path::new(p).exists() {
            return Some(PathBuf::from(p));
        }
    }
    let path = std::env::var_os("PATH")?;
    std::env::split_paths(&path)
        .map(|d| d.join("tectonic"))
        .find(|p| p.exists())
}

fn compile_blocking(path: String) -> Result<CompileResult, String> {
    let tectonic = find_tectonic()
        .ok_or_else(|| "Tectonic not found. Install it with: brew install tectonic".to_string())?;
    let src = PathBuf::from(&path);
    let dir = src.parent().ok_or("Invalid file path")?;
    let stem = src
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or("Invalid file name")?
        .to_string();

    let mut h = DefaultHasher::new();
    path.hash(&mut h);
    let outdir = std::env::temp_dir()
        .join("proofpad")
        .join(format!("{:016x}", h.finish()));
    std::fs::create_dir_all(&outdir).map_err(|e| e.to_string())?;
    let pdf = outdir.join(format!("{stem}.pdf"));
    let _ = std::fs::remove_file(&pdf);

    let start = Instant::now();
    let out = Command::new(tectonic)
        .args(["-X", "compile", "--keep-logs", "--outdir"])
        .arg(&outdir)
        .arg(&src)
        .current_dir(dir)
        .output()
        .map_err(|e| format!("Could not run Tectonic: {e}"))?;
    let duration_ms = start.elapsed().as_millis() as u64;

    let output = format!(
        "{}{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    let log = std::fs::read_to_string(outdir.join(format!("{stem}.log"))).unwrap_or_default();
    let ok = out.status.success() && pdf.exists();
    Ok(CompileResult {
        ok,
        pdf_path: if ok { Some(pdf.to_string_lossy().into_owned()) } else { None },
        output,
        log,
        duration_ms,
    })
}

#[tauri::command]
async fn compile(path: String) -> Result<CompileResult, String> {
    tauri::async_runtime::spawn_blocking(move || compile_blocking(path))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
fn read_text(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_text(path: String, contents: String) -> Result<(), String> {
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_bytes(path: String) -> Result<tauri::ipc::Response, String> {
    std::fs::read(&path)
        .map(tauri::ipc::Response::new)
        .map_err(|e| e.to_string())
}

#[derive(Serialize)]
struct UserTemplate {
    name: String,
    file: String,
    src: String,
}

/// ~/Library/Application Support/Proofpad/templates/*.tex (the folder is created if missing).
#[tauri::command]
fn list_user_templates(app: tauri::AppHandle) -> Result<Vec<UserTemplate>, String> {
    use tauri::Manager;
    let dir = app
        .path()
        .data_dir()
        .map_err(|e| e.to_string())?
        .join("Proofpad")
        .join("templates");
    let _ = std::fs::create_dir_all(&dir);
    let mut out = Vec::new();
    for entry in std::fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let p = entry.map_err(|e| e.to_string())?.path();
        if p.extension().and_then(|x| x.to_str()) != Some("tex") {
            continue;
        }
        let (Some(name), Some(file)) = (
            p.file_stem().and_then(|s| s.to_str()),
            p.file_name().and_then(|s| s.to_str()),
        ) else {
            continue;
        };
        if let Ok(src) = std::fs::read_to_string(&p) {
            out.push(UserTemplate { name: name.into(), file: file.into(), src });
        }
    }
    out.sort_by_key(|t| t.name.to_lowercase());
    Ok(out)
}

#[tauri::command]
fn copy_file(from: String, to: String) -> Result<(), String> {
    std::fs::copy(&from, &to).map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

fn build_menu(app: &tauri::AppHandle) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    use tauri::menu::{Menu, MenuItem, Submenu, HELP_SUBMENU_ID};
    let menu = Menu::default(app)?;
    let item = MenuItem::with_id(app, "symbols", "Symbol Reference", true, None::<&str>)?;
    match menu.get(HELP_SUBMENU_ID).and_then(|k| k.as_submenu().cloned()) {
        Some(help) => help.append(&item)?,
        None => menu.append(&Submenu::with_items(app, "Help", true, &[&item])?)?,
    }
    Ok(menu)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri::Emitter;
    tauri::Builder::default()
        .menu(build_menu)
        .on_menu_event(|app, event| {
            if event.id() == "symbols" {
                let _ = app.emit("open-symbols", ());
            }
        })
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            compile, read_text, write_text, read_bytes, file_exists, copy_file, list_user_templates
        ])
        .run(tauri::generate_context!())
        .expect("error while running Proofpad");
}
