// src/components/ModelViewer.tsx
import React, { forwardRef } from "react";
import type { CSSProperties } from "react";

const RawModelViewer: any = "model-viewer";

export type ModelViewerHandle = any;

export type ModelViewerProps = {
  src: string;
  ar?: boolean;
  ["ar-modes"]?: string;
  ["camera-controls"]?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
  className?: string;
};

const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(
  (props, ref) => <RawModelViewer ref={ref} {...props} />
);

export default ModelViewer;
