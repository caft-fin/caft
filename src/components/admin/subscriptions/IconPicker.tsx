'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Check, CheckCircle2, X, XCircle, Star, Zap, Shield, Lock, Globe, Cloud,
  CreditCard, Wallet, TrendingUp, BarChart3, PieChart, LineChart, Activity,
  Users, User, Bell, Mail, MessageSquare, Phone, Video, Camera, Image,
  FileText, Folder, Database, Server, Cpu, Monitor, Smartphone, Wifi,
  Award, Target, Flag, Bookmark, Heart, ThumbsUp, Eye, Search, Settings,
  Layers, Layout, Grid, Box, Package, Gift, ShoppingCart, Truck, Home,
  Building, Briefcase, Calendar, Clock, Timer, Infinity, Sparkles, Flame,
  Crown, Diamond, Gem, Rocket, Send, Download, Upload, RefreshCw, Headphones,
} from 'lucide-react';

import React from 'react';

export const ICON_OPTIONS: { name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'check', icon: Check },
  { name: 'check-circle', icon: CheckCircle2 },
  { name: 'x', icon: X },
  { name: 'x-circle', icon: XCircle },
  { name: 'star', icon: Star },
  { name: 'zap', icon: Zap },
  { name: 'shield', icon: Shield },
  { name: 'lock', icon: Lock },
  { name: 'globe', icon: Globe },
  { name: 'cloud', icon: Cloud },
  { name: 'credit-card', icon: CreditCard },
  { name: 'wallet', icon: Wallet },
  { name: 'trending-up', icon: TrendingUp },
  { name: 'bar-chart', icon: BarChart3 },
  { name: 'pie-chart', icon: PieChart },
  { name: 'line-chart', icon: LineChart },
  { name: 'activity', icon: Activity },
  { name: 'users', icon: Users },
  { name: 'user', icon: User },
  { name: 'bell', icon: Bell },
  { name: 'mail', icon: Mail },
  { name: 'message', icon: MessageSquare },
  { name: 'phone', icon: Phone },
  { name: 'video', icon: Video },
  { name: 'camera', icon: Camera },
  { name: 'image', icon: Image },
  { name: 'file', icon: FileText },
  { name: 'folder', icon: Folder },
  { name: 'database', icon: Database },
  { name: 'server', icon: Server },
  { name: 'cpu', icon: Cpu },
  { name: 'monitor', icon: Monitor },
  { name: 'smartphone', icon: Smartphone },
  { name: 'wifi', icon: Wifi },
  { name: 'award', icon: Award },
  { name: 'target', icon: Target },
  { name: 'flag', icon: Flag },
  { name: 'bookmark', icon: Bookmark },
  { name: 'heart', icon: Heart },
  { name: 'thumbs-up', icon: ThumbsUp },
  { name: 'eye', icon: Eye },
  { name: 'search', icon: Search },
  { name: 'settings', icon: Settings },
  { name: 'layers', icon: Layers },
  { name: 'layout', icon: Layout },
  { name: 'grid', icon: Grid },
  { name: 'box', icon: Box },
  { name: 'package', icon: Package },
  { name: 'gift', icon: Gift },
  { name: 'cart', icon: ShoppingCart },
  { name: 'truck', icon: Truck },
  { name: 'home', icon: Home },
  { name: 'building', icon: Building },
  { name: 'briefcase', icon: Briefcase },
  { name: 'calendar', icon: Calendar },
  { name: 'clock', icon: Clock },
  { name: 'timer', icon: Timer },
  { name: 'infinity', icon: Infinity },
  { name: 'sparkles', icon: Sparkles },
  { name: 'flame', icon: Flame },
  { name: 'crown', icon: Crown },
  { name: 'diamond', icon: Diamond },
  { name: 'gem', icon: Gem },
  { name: 'rocket', icon: Rocket },
  { name: 'send', icon: Send },
  { name: 'download', icon: Download },
  { name: 'upload', icon: Upload },
  { name: 'refresh', icon: RefreshCw },
  { name: 'headphones', icon: Headphones },
];

export function getIconComponent(name: string | null | undefined): React.ComponentType<{ className?: string }> | null {
  if (!name) return CheckCircle2;
  const found = ICON_OPTIONS.find(o => o.name === name);
  return found ? found.icon : CheckCircle2;
}

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = ICON_OPTIONS.filter(o => o.name.includes(search.toLowerCase()));
  const iconComponent = getIconComponent(value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors"
      >
        {iconComponent && React.createElement(iconComponent, { className: "w-4 h-4 text-gray-600" })}
      </button>
      {open && (
        <div className="absolute z-50 top-12 left-0 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 w-72">
          <input
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 mb-2 focus:outline-none focus:border-orange-300"
          />
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
            {filtered.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => { onChange(opt.name); setOpen(false); setSearch(''); }}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    value === opt.name ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title={opt.name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
