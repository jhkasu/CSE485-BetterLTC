import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function usePageTitle(title) {
  const { t } = useTranslation();
  const site = t('common.siteName');
  useEffect(() => {
    document.title = title ? `${title} | ${site}` : site;
  }, [title, site]);
}
