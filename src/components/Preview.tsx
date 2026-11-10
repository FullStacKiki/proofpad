import { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export const ZOOMS = [0.75, 1, 1.25, 1.5, 2];
const BASE_WIDTH = 560;

interface Props {
  data: Uint8Array | null;
  version: number;
  zoom: number;
  stale: boolean;
  noBuild: boolean;
  onZoom(z: number): void;
}

export function Preview({ data, version, zoom, stale, noBuild, onZoom }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const pages = useRef<HTMLDivElement>(null);
  const gen = useRef(0);
  const lastZoom = useRef(zoom);

  // Pages are rendered off-DOM and swapped in at once, so the scroll position survives recompiles.
  useEffect(() => {
    const mine = ++gen.current;
    if (!data) {
      pages.current?.replaceChildren();
      return;
    }
    let pdf: pdfjs.PDFDocumentProxy | undefined;
    (async () => {
      try {
        pdf = await pdfjs.getDocument({ data: data.slice() }).promise;
        const dpr = window.devicePixelRatio || 1;
        const wrappers: HTMLElement[] = [];
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          if (mine !== gen.current) return;
          const scale = (BASE_WIDTH * zoom) / page.getViewport({ scale: 1 }).width;
          const vp = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(vp.width * dpr);
          canvas.height = Math.floor(vp.height * dpr);
          canvas.style.width = `${vp.width}px`;
          canvas.style.height = `${vp.height}px`;
          const ctx = canvas.getContext('2d')!;
          await page.render({
            canvas,
            canvasContext: ctx,
            viewport: vp,
            transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
          }).promise;
          const wrap = document.createElement('div');
          wrap.className = 'page';
          wrap.style.width = `${vp.width}px`;
          wrap.style.height = `${vp.height}px`;
          wrap.append(canvas);
          wrappers.push(wrap);
        }
        if (mine !== gen.current) return;
        const sc = scroller.current!;
        const top = sc.scrollTop;
        const h = sc.scrollHeight || 1;
        pages.current!.replaceChildren(...wrappers);
        sc.scrollTop = lastZoom.current !== zoom ? top * (sc.scrollHeight / h) : top;
        lastZoom.current = zoom;
      } catch (e) {
        console.error('PDF render failed', e);
      } finally {
        pdf?.destroy();
      }
    })();
  }, [data, version, zoom]);

  const i = ZOOMS.indexOf(zoom);
  return (
    <div className="preview">
      <div className="preview-scroll" ref={scroller}>
        {stale && (
          <div className="stale">
            <span className="dot orange" />
            Showing last successful build
          </div>
        )}
        <div className="pages" ref={pages} />
        {noBuild && <div className="no-build">No successful build yet</div>}
      </div>
      {data && (
        <div className="zoombar">
          <button onClick={() => i > 0 && onZoom(ZOOMS[i - 1])}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => i < ZOOMS.length - 1 && onZoom(ZOOMS[i + 1])}>+</button>
        </div>
      )}
    </div>
  );
}
