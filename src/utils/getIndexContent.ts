
export default (
  templatesConfig,
) => `import React, { FC } from 'react';
import { List } from 'antd-mobile';
import { history } from 'alita';

const { Item } = List;
const { Brief } = Item;
interface PageProps { }

const AbcPage: FC<PageProps> = ({  }) => {
  const templatesConfig = ${JSON.stringify(templatesConfig)}

  const listTopData = Object.keys(templatesConfig).map(template => ({
    path: template,
    ...templatesConfig[template]
  }));
  return (
    <List
      renderHeader={() => '模版列表'}
      renderFooter={() =>
        '开发时请使用 alita dev templateName 方式打开'
      }
    >
      {listTopData.map((value) => (
        <Item
          arrow="horizontal"
          multipleLine
          key={value?.path}
          onClick={() => {
            history.push(value?.path);
          }}
        >
        {value?.navbar?.title}<Brief>{value?.name}<br/>{value?.description}</Brief>
        </Item>
      ))}
    </List>
  );
};

export default AbcPage;
`;