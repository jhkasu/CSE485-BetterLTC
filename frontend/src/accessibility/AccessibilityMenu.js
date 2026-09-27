import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibilitySettings } from './AccessibilityContext';
import './AccessibilityMenu.css';

const FONT_SIZE_LABELS = {
  normal: 'a11y.sizeDefault',
  large: 'a11y.sizeLarge',
  xlarge: 'a11y.sizeXLarge',
};

const CONTRAST_LABELS = {
  light: 'a11y.contrastLight',
  dark: 'a11y.contrastDark',
  high: 'a11y.contrastHigh',
};

function OptionGroup({ legend, name, options, labels, value, onChange, sampleClass }) {
  const { t } = useTranslation();
  return (
    <fieldset className="a11y-group">
      <legend className="a11y-legend">{legend}</legend>
      <div className="a11y-options">
        {options.map((option) => (
          <label key={option} className={`a11y-option${value === option ? ' selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {sampleClass && (
              <span className={`${sampleClass} ${sampleClass}-${option}`} aria-hidden="true">A</span>
            )}
            <span>{t(labels[option])}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function AccessibilityMenu({ placement = 'below', className = '' }) {
  const { contrast, fontSize, setContrast, setFontSize, reset, contrastModes, fontSizes } =
    useAccessibilitySettings();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const groupName = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const onBlur = (e) => {
    const next = e.relatedTarget;
    if (next instanceof HTMLElement && rootRef.current && !rootRef.current.contains(next)) setOpen(false);
  };

  return (
    <div className={`a11y-menu ${className}`.trim()} ref={rootRef} onBlur={onBlur}>
      <button
        type="button"
        ref={buttonRef}
        className="a11y-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="a11y-trigger-icon" aria-hidden="true">Aa</span>
        <span className="a11y-trigger-label">{t('a11y.display')}</span>
      </button>
      {open && (
        <div
          id={panelId}
          className={`a11y-panel a11y-panel-${placement}`}
          role="group"
          aria-label={t('a11y.settings')}
        >
          <OptionGroup
            legend={t('a11y.textSize')}
            name={`${groupName}-font`}
            options={fontSizes}
            labels={FONT_SIZE_LABELS}
            value={fontSize}
            onChange={setFontSize}
            sampleClass="a11y-sample"
          />
          <OptionGroup
            legend={t('a11y.contrast')}
            name={`${groupName}-contrast`}
            options={contrastModes}
            labels={CONTRAST_LABELS}
            value={contrast}
            onChange={setContrast}
          />
          <button type="button" className="a11y-reset" onClick={reset}>
            {t('a11y.reset')}
          </button>
        </div>
      )}
    </div>
  );
}

export default AccessibilityMenu;
