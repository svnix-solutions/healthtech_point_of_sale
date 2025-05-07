import { useEffect, useRef, useState } from 'react';

interface InjectableIframeProps {
  script?: string;
  height?: string;
  width?: string;
  className?: string;
  title?: string;
  url?: string;
}

const InjectableIframe = ({
  script = '',
  height = '100%',
  width = '100%',
  className = '',
  title = 'Injectable iframe',
  url = 'about:blank'
}: InjectableIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<string>(height);
  const [iframeWidth, setIframeWidth] = useState<string>(width);

  useEffect(() => {
    const handleResizeMessage = (event: MessageEvent) => {
      // Verify the origin of the message for security
      if (event.origin === window.location.origin) {
        if (event.data) {
          if (typeof event.data.height === 'number') {
            setIframeHeight(`${event.data.height}px`);
          }
          if (typeof event.data.width === 'number') {
            // Limit width to 1290px
            const maxWidth = Math.min(event.data.width, 1290);
            setIframeWidth(`${maxWidth}px`);
          }
        }
      }
    };

    window.addEventListener('message', handleResizeMessage);

    const injectScript = () => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        try {
          // Create a ResizeObserver to watch for content size changes
          const colorScript = `
            // Inject style element for background color
            const style = document.createElement('style');
            style.textContent = ':root {--navbar-height: 0;} .sticky-top { display: none; }';
            document.head.appendChild(style);
          `;

          const resizeScript = `  
            // Create a ResizeObserver to watch for content size changes
            const resizeObserver = new ResizeObserver(entries => {
              const height = document.documentElement.scrollHeight;
              const width = document.documentElement.scrollWidth;
              window.parent.postMessage({ height, width }, '${window.location.origin}');
            });

            // Start observing the document body
            resizeObserver.observe(document.body);
            
            // Initial size measurement
            const initialHeight = document.documentElement.scrollHeight;
            const initialWidth = document.documentElement.scrollWidth;
            window.parent.postMessage({ 
              height: initialHeight,
              width: initialWidth 
            }, '${window.location.origin}');
          `;

          const injectFunction = new Function(resizeScript);
          injectFunction.call(iframe.contentWindow);

          // Create and inject a script element
          const scriptElement = iframe.contentDocument?.createElement('script');
          if (scriptElement) {
            scriptElement.textContent = colorScript;
            iframe.contentDocument?.head.appendChild(scriptElement);
          }
        } catch (error) {
          console.error('Error injecting script:', error);
        }
      }
    };

    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        injectScript();
      };
    }

    return () => {
      window.removeEventListener('message', handleResizeMessage);
    };
  }, [script]);

  return (
    <div className="flex justify-center w-full">
      <iframe
        ref={iframeRef}
        src={url}
        style={{ height: iframeHeight, width: iframeWidth, maxWidth: '1290px' }}
        className={`border rounded-lg ${className}`}
        sandbox="allow-scripts allow-same-origin"
        title={title}
      />
    </div>
  );
};

export default InjectableIframe; 