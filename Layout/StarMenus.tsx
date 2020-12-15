import React, { useState } from 'react';
import _ from 'lodash'
import { Icon } from 'antd';
import classnames from 'classnames'
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { MenuChild, prefixCls } from './config';
import { isAbsolutePath } from './utils';
import { parseJSON } from '@pkgs/utils';

interface Props {
  items: MenuChild[];
  setItems: (newItems: any) => void;
}

const cPrefixCls = `${prefixCls}-layout`;

export default function StarMenus(props: Props) {
  const [historyList, setHistoryList] = useState(parseJSON(localStorage.getItem('menusHistory') as string));

  const setLocal = (name: any) => {
    props.setItems(name);
    const jsonArrayString = JSON.stringify(name);
    localStorage.setItem('stars', jsonArrayString);
  };

  const setHistoryLocal = (name: any) => {
    setHistoryList(name);
    const jsonArrayString = JSON.stringify(name);
    localStorage.setItem('menusHistory', jsonArrayString);
  };

  const DragHandle = SortableHandle(() =>
    <svg className="icontuozhuai" aria-hidden="true">
      <use xlinkHref='#icontuozhuaianniu'></use>
    </svg>);

  const Item = SortableElement(({ value, sortIndex }: { value: MenuChild, sortIndex: number }) => {
    return (
      <li className={classnames({
        [`${cPrefixCls}-menus-sider-menus-item`]: true,
        // [`${cPrefixCls}-menus-sider-menus-item-inSort`]: inSort,
      })}>
        <a
          href={isAbsolutePath(value.path) ? value.path : `/${value.path}`}
          className={`${cPrefixCls}-menus-sider-menus-item-link`}
          onClick={() => {
            const newHistory = _.concat(value, historyList);
            const newArr = _.unionBy(newHistory, 'name');
            setHistoryLocal(newArr);
          }}
        >
          <svg className={`${cPrefixCls}-menus-icon`} aria-hidden="true">
            <use xlinkHref={value.icon}></use>
          </svg>
          {value.name}
        </a>
        <span className={`${cPrefixCls}-menus-sider-menus-item-right`}>
          <Icon
            type="close"
            style={{ marginRight: 5, cursor: 'pointer', width: 10, height: 10 }}
            onClick={() => {
              const newItems = _.remove(props.items, (_item, index) => {
                return index !== sortIndex;
              });
              setLocal(newItems);
            }}
          />
          <DragHandle />
        </span>
      </li>
    );
  });
  const Container = SortableContainer(({ children }: { children: React.ReactNode[] }) => {
    return <ul className={`${cPrefixCls}-menus-sider-menus`}>{children}</ul>;
  });
  return (
    <Container
      useDragHandle
      lockAxis="y"
      onSortEnd={({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }) => {
        setLocal(arrayMove(props.items, oldIndex, newIndex))
      }}
    >
      {_.map(props.items, (item, index) => (
        <Item key={`item-${item.name}`} index={index} sortIndex={index} value={item} />
      ))}
    </Container>
  );
};
