'use client';

import React from 'react';
import Link from 'next/link';
import { Headphones, Smartphone, Globe, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto pb-28">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Mission */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Headphones className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">มาฟังนิยาย</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            ศูนย์รวมนิยายเสียงภาษาไทย แปลสดใหม่ คัดสรรคุณภาพ เสียงพากย์และซาวด์เอฟเฟกต์จัดเต็ม ฟังได้สะดวกทุกที่ทุกเวลา ทั้งมือถือและคอมพิวเตอร์
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">หมวดหมู่นิยายยอดฮิต</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/novels?category=กำลังภายใน" className="hover:text-purple-400 transition-colors">กำลังภายใน / เทพสงคราม</Link></li>
            <li><Link href="/novels?category=รักโรแมนติก / ย้อนยุค" className="hover:text-purple-400 transition-colors">รักโรแมนติก / ย้อนยุค</Link></li>
            <li><Link href="/novels?category=แฟนตาซี / เกมออนไลน์" className="hover:text-purple-400 transition-colors">แฟนตาซี / เกมออนไลน์</Link></li>
            <li><Link href="/novels?category=สืบสวนสอบสวน / สยองขวัญ" className="hover:text-purple-400 transition-colors">สืบสวนสอบสวน / ปริศนา</Link></li>
          </ul>
        </div>

        {/* Features & Roadmap */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">ฟีเจอร์เด่น</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              ระบบบันทึกตำแหน่งการฟังอัตโนมัติ
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              ตั้งเวลาปิด (Sleep Timer) & ปรับความเร็ว
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              เล่นตอนถัดไปให้อัตโนมัติ (Auto-Next)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              รองรับ PWA & Android App ในอนาคต
            </li>
          </ul>
        </div>

        {/* Mobile & PWA Badge preview */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">แอปพลิเคชัน</h4>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">พร้อมใช้งานแบบ PWA</p>
                <p className="text-[11px] text-slate-400">ติดตั้งลงบนหน้าจอมือถือได้ทันที</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-emerald-400" /> Web App</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-purple-400" /> Version 1.0</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 มาฟังนิยาย (MaFangNiyai). All rights reserved.</p>
        <p className="flex items-center gap-1 text-slate-400">
          สร้างสรรค์ผลงานด้วยความรักและเสียงคุณภาพ <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </p>
      </div>
    </footer>
  );
};
