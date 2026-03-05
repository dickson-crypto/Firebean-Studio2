
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  Baseline,
  ChevronDown,
  Clipboard,
  Copy,
  Download,
  Film,
  FileImage,
  Image,
  KeyRound,
  Layers,
  Lock,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  ScanEye,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Tv,
  X,
  Wand2,
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 1.5,
};

export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <KeyRound {...defaultProps} {...props} />
);

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <RefreshCw {...defaultProps} {...props} />;

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Sparkles {...defaultProps} {...props} />
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Plus {...defaultProps} {...props} />
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ChevronDown {...defaultProps} {...props} />;

export const SlidersHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <SlidersHorizontal {...defaultProps} {...props} />;

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowRight {...defaultProps} {...props} />;

export const RectangleStackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Layers {...defaultProps} {...props} />;

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <X {...defaultProps} {...props} />
);

export const TextModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Baseline {...defaultProps} {...props} />
);

export const FramesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Image {...defaultProps} {...props} />
;

export const ReferencesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Film {...defaultProps} {...props} />;

export const TvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Tv {...defaultProps} {...props} />
);

export const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Film {...defaultProps} {...props} />
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Download {...defaultProps} {...props} />
);

export const FileImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <FileImage {...defaultProps} {...props} />
);

export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Palette {...defaultProps} {...props} />
);

export const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Lock {...defaultProps} {...props} />
);

export const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Wand2 {...defaultProps} {...props} />
);

export const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Pencil {...defaultProps} {...props} />
);

export const ScanEyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ScanEye {...defaultProps} {...props} />
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Copy {...defaultProps} {...props} />
);

export const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Clipboard {...defaultProps} {...props} />
);

export const Settings2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Settings2 {...defaultProps} {...props} />
);

// This icon had a different stroke width in the original file, so we preserve it.
export const CurvedArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowDown {...props} strokeWidth={3} />;
