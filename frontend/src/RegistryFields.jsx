import React from 'react';
import { useTranslation } from 'react-i18next';
import { REGISTRY_TYPES } from './registry';
import './RegistryFields.css';

function RegistryFields({ idPrefix, type, number, error, onChange }) {
  const { t } = useTranslation();
  const current = REGISTRY_TYPES.find(option => option.value === type);
  return (
    <div className="registry-fields">
      <fieldset className="registry-types">
        <legend>{t('registry.typeLabel')}</legend>
        {REGISTRY_TYPES.map(option => (
          <label key={option.value} className="registry-type">
            <input
              type="radio"
              name={`${idPrefix}-type`}
              value={option.value}
              checked={type === option.value}
              onChange={() => onChange({ registryType: option.value })}
            />
            <span>{t(option.labelKey)}</span>
          </label>
        ))}
      </fieldset>
      <label htmlFor={`${idPrefix}-number`}>{t('registry.numberLabel')}</label>
      <input
        id={`${idPrefix}-number`}
        name="registryNumber"
        value={number}
        maxLength={40}
        autoComplete="off"
        placeholder={current ? current.placeholder : ''}
        aria-describedby={`${idPrefix}-hint`}
        onChange={e => onChange({ registryNumber: e.target.value })}
      />
      <p id={`${idPrefix}-hint`} className="registry-hint">{t(current ? current.hintKey : 'registry.hints.choose')}</p>
      {error && <p className="error registry-error" role="alert">{t(error)}</p>}
    </div>
  );
}

export default RegistryFields;
