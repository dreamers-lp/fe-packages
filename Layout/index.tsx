import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  Layout,
  Dropdown,
  Menu,
  Icon,
  Drawer,
  Divider,
  Badge,
  TreeSelect,
  Popover,
} from 'antd';
import { normalizeTreeData } from './utils';
import { auth } from '../Auth';
import { prefixCls } from './config';
import HeaderMenu from './HeaderMenu';
import Settings from './Settings';
import './style.less';
import './assets/iconfont/iconfont.css';
import './assets/iconfont/iconfont.js';
// const developmentFeConf = require('../../../config/feConfig.json');

interface Props {
  tenantProjectVisible: boolean;
  children: React.ReactNode;
  language: string;
  onLanguageChange: (language: string) => void;
  selectedTenantProject: any;
  setSelectedTenantProject: (newSelectedTenantProject: any) => void;
  belongProjects: any;
  onMount: () => void;
}

const userIconSrc = require('./assets/avatars.png');
const { Header } = Layout;
const getSymbolByLanguage = (language: string) => {
  if (language === 'zh') return '#iconzhongwenicon';
  if (language === 'en') return '#iconyingwenicon';
  return '';
};
const normalizeTenantProjectData = (
  data: any[],
  tenantIdent?: string,
  tenantId?: number
): any => {
  return _.map(data, (item) => {
    if (item.children) {
      return {
        ...item,
        tenantIdent: tenantIdent || item.ident,
        tenantId: tenantId || item.id,
        children: normalizeTenantProjectData(
          item.children,
          tenantIdent || item.ident,
          tenantId || item.id
        ),
      };
    }
    return {
      ...item,
      tenantIdent,
      tenantId,
    };
  });
};
const renderTreeNodes = (nodes: any[]) => {
  return _.map(nodes, (node) => {
    if (_.isArray(node.children)) {
      return (
        <TreeSelect.TreeNode
          title={node.ident}
          fullTitle={`${node.tenantIdent}-${node.ident}`}
          key={String(node.id)}
          value={node.id}
          path={node.path}
          node={node}
          selectable={false}
        >
          {renderTreeNodes(node.children)}
        </TreeSelect.TreeNode>
      );
    }
    return (
      <TreeSelect.TreeNode
        title={node.ident}
        fullTitle={`${node.tenantIdent}-${node.ident}`}
        key={String(node.id)}
        value={node.id}
        path={node.path}
        isLeaf={true}
        node={node}
      />
    );
  });
};

export default function index(props: Props) {
  const cPrefixCls = `${prefixCls}-layout`;
  const [dispname, setDispname] = useState('');
  const [menusVisible, setMenusVisible] = useState(false);
  const [menusContentVsible, setMenusContentVisible] = useState(false);
  const [feConf, setFeConf] = useState({});
  const treeData = normalizeTreeData(props.belongProjects);
  const cacheProject = _.attempt(
    JSON.parse.bind(null, localStorage.getItem('icee-global-project') as string)
  );
  const content = <p style={{ height: 0 }}>工单</p>;
  const message = <p style={{ height: 0 }}>消息</p>;
  const text = <p style={{ height: 0 }}>文档中心</p>;

  useEffect(() => {
    auth.checkAuthenticate().then(() => {
      setDispname(_.get(auth.getSelftProfile(), 'dispname'));
      props.onMount();
    });
    fetch('/static/feConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setFeConf(res);
      });
    // if (process.env.NODE_ENV === 'development') {
    //   setFeConf(developmentFeConf);
    // } else if (process.env.NODE_ENV === 'production') {
    //   fetch('/static/feConfig.json')
    //     .then((res) => {
    //       return res.json();
    //     })
    //     .then((res) => {
    //       setFeConf(res);
    //     });
    // }
  }, []);

  return (
    <Layout className={cPrefixCls}>
      <Header className={`${cPrefixCls}-header`}>
        <div className={`${cPrefixCls}-header-left`}>
          <div
            className={classnames({
              [`${cPrefixCls}-header-menu`]: true,
              [`${cPrefixCls}-header-menu-active`]: menusVisible,
            })}
            onClick={() => {
              setMenusVisible(!menusVisible);
              setMenusContentVisible(false);
            }}
          >
            <Icon type={!menusVisible ? 'menu' : 'close'} />
          </div>
          <Link to="/" className={`${cPrefixCls}-logo`}>
            <img
              src={_.get(feConf, 'header.logo')}
              alt="logo"
              style={{
                height: 24,
              }}
            />
            {_.get(feConf, 'header.subTitle')}
          </Link>
        </div>
        <div className={`${cPrefixCls}-header-right`}>
          {_.get(feConf, 'header.mode') === 'complicated' ? (
            <>
              {props.tenantProjectVisible ? (
                <TreeSelect
                  size="small"
                  showSearch
                  style={{ width: '200px', position: 'relative', top: -2 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择租户和项目"
                  treeNodeLabelProp="fullTitle"
                  allowClear
                  treeDefaultExpandAll
                  value={_.get(cacheProject, 'id')}
                  onChange={(_value, _label, extra) => {
                    const newSelectedTenantProject = {
                      tenant: {
                        id: _.get(extra, 'triggerNode.props.node.tenantId'),
                        ident: _.get(
                          extra,
                          'triggerNode.props.node.tenantIdent'
                        ),
                      },
                      project: {
                        id: _.get(extra, 'triggerNode.props.node.id'),
                        ident: _.get(extra, 'triggerNode.props.node.ident'),
                      },
                    };
                    props.setSelectedTenantProject(newSelectedTenantProject);
                    localStorage.setItem(
                      'icee-global-tenant',
                      JSON.stringify(newSelectedTenantProject.tenant)
                    );
                    localStorage.setItem(
                      'icee-global-project',
                      JSON.stringify(newSelectedTenantProject.project)
                    );
                  }}
                >
                  {renderTreeNodes(normalizeTenantProjectData(treeData))}
                </TreeSelect>
              ) : null}
              <div className={`${cPrefixCls}-header-right-links`}>
                <a>运营后台</a>
                <a href="/rdb">用户中心</a>
              </div>
              <Divider
                className={`${cPrefixCls}-header-right-divider`}
                type="vertical"
              />
              <div className={`${cPrefixCls}-header-right-icons`}>
                <a>
                  <Badge dot>
                    <Popover content={content}>
                      <span className="iconfont icongongdanicon" />
                    </Popover>
                  </Badge>
                </a>
                <a className="text">
                  <Popover content={message}>
                    <span className="iconfont iconxiaoxiicon" />
                  </Popover>
                  <Badge count={5} className="badge"></Badge>
                </a>
                <a>
                  <Popover content={text}>
                    <span className="iconfont iconwendangicon" />
                  </Popover>
                </a>
                {/* <a
                    onClick={() => {
                      const newLanguage = props.language == 'en' ? 'zh' : 'en';
                      props.onLanguageChange(newLanguage);
                    }}
                  >
                    <svg style={{ width: 20, height: 14 }} aria-hidden="true">
                      <use xlinkHref={getSymbolByLanguage(props.language)}></use>
                    </svg>
                  </a> */}
              </div>
              <Divider
                className={`${cPrefixCls}-header-right-divider`}
                type="vertical"
              />
            </>
          ) : null}
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu style={{ width: 125 }}>
                <Menu.Item>
                  <a
                    onClick={() => {
                      Settings({
                        language: props.language,
                      });
                    }}
                  >
                    <Icon type="setting" className="mr10" />
                    <FormattedMessage id="user.settings" />
                  </a>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item>
                  <a
                    onClick={() => {
                      auth.signout(() => {
                        window.location.href = '/login';
                      });
                    }}
                  >
                    <Icon type="logout" className="mr10" />
                    <FormattedMessage id="logout" />
                  </a>
                </Menu.Item>
              </Menu>
            }
          >
            <span className={`${cPrefixCls}-username`}>
              <img src={userIconSrc} alt="" />
              <span style={{ paddingRight: 5 }}>{dispname}</span>
              <Icon type="down" />
            </span>
          </Dropdown>
        </div>
      </Header>
      <div
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className={`${cPrefixCls}-main`}>{props.children}</div>
        <Drawer
          placement="left"
          width={menusContentVsible ? 1190 : 190}
          closable={false}
          visible={menusVisible}
          getContainer={false}
          style={{ position: 'absolute' }}
          drawerStyle={{
            overflow: 'hidden',
          }}
          bodyStyle={{
            padding: 0,
          }}
          onClose={() => {
            setMenusVisible(false);
          }}
        >
          <HeaderMenu
            menusContentVsible={menusContentVsible}
            setMenusContentVisible={setMenusContentVisible}
            setMenusVisible={setMenusVisible}
          />
        </Drawer>
      </div>
    </Layout>
  );
}