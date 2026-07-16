import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CodeXml,
  Gamepad2,
  GitFork,
  LockKeyhole,
  Mail,
  Menu,
  Moon,
  Music2,
  Volume2,
  VolumeX,
  Wrench,
  X,
  createIcons,
} from 'lucide'

const icons = {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CodeXml,
  Gamepad2,
  GitFork,
  LockKeyhole,
  Mail,
  Menu,
  Moon,
  Music2,
  Volume2,
  VolumeX,
  Wrench,
  X,
}

export function renderIcons(root = document) {
  createIcons({
    icons,
    root,
    attrs: {
      width: 18,
      height: 18,
      'stroke-width': 1.7,
    },
  })
}
