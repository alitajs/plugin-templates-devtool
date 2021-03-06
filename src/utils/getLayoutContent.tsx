
export default (
  templatesConfig,
) => `import React, { useState, useEffect } from 'react';
import { NavBar, Icon } from 'antd-mobile';
import { history } from 'alita';

interface TemplateConfig {
  name?: string;
  navbar?: {
    title?: string;
    backgroundColor?: string;
    color?: string;
    display?: string;
  };
  backgroundColor?: string;
}

const templatesConfig = ${JSON.stringify(templatesConfig)} as { [k: string]: TemplateConfig };

export default ({ children, location: { pathname }, }) => {

  const [template, setTemplate] = useState<TemplateConfig>({});
  useEffect(() => {
    setTemplate(templatesConfig[pathname]||{
      name: '首页',
      navbar: {
        title: '首页',
        backgroundColor: '#FFFFFF',
        color: '#333333',
        display: 'flex'
      },
      backgroundColor: '#F5F5F5'
    });
  }, [pathname])
  const isHome = pathname === '/';
  return (
    <div style={{ minHeight: '100vh', backgroundColor: template?.backgroundColor || '' }}>
      <NavBar icon={<Icon type="left" />} onLeftClick={() => !isHome && history.goBack()} style={{ backgroundColor: template?.navbar?.backgroundColor || '', color: template?.navbar?.color || '', display: template?.navbar?.display || 'flex' }}>{template?.navbar?.title || template?.name || ''}</NavBar>
      {children}
    </div>
  );
};

`;
