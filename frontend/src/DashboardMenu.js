import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdMenu } from 'react-icons/md';
import './DashboardMenu.css';

export function useDashboardMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const first = panelRef.current?.querySelector('button, a, [tabindex="0"]');
    if (first) first.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return { open, setOpen, buttonRef, panelRef };
}

export function DashboardTopBar({ menu, panelId, title }) {
  const { t } = useTranslation();
  return (
    <div className="dash-topbar">
      <button
        ref={menu.buttonRef}
        type="button"
        className="dash-menu-btn"
        aria-expanded={menu.open}
        aria-controls={panelId}
        onClick={() => menu.setOpen(true)}
      >
        <MdMenu aria-hidden="true" />
        <span>{t('dashboardMenu.menu')}</span>
      </button>
      <span className="dash-topbar-title">{title}</span>
    </div>
  );
}

export function DashboardMenuClose({ menu }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="dash-close"
      aria-label={t('dashboardMenu.close')}
      onClick={() => {
        menu.setOpen(false);
        if (menu.buttonRef.current) menu.buttonRef.current.focus();
      }}
    >
      <MdClose aria-hidden="true" />
    </button>
  );
}

export function DashboardBackdrop({ menu }) {
  if (!menu.open) return null;
  return <div className="dash-backdrop" onClick={() => menu.setOpen(false)} aria-hidden="true" />;
}
