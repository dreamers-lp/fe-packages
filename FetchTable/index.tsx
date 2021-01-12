import React, { Component } from 'react';
import { Table } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';
import { TableProps } from 'antd/lib/table';
import _ from 'lodash';
import queryString from 'query-string';
import * as config from '../config';
import request from '../request';
import { Consumer } from '../../app';
import './style.less';

interface FetchQuery {
  [index: string]: string | number | undefined,
}

interface Props {
  backendPagingEnabled?: boolean,
  url: string,
  query?: FetchQuery,
  tableProps: TableProps<any>,
  fetchFunc?: (url: string, pagination: any) => Promise<any>,
  processData?: (data: any[], response: any) => Promise<any>,
  handleTableChange?: (pagination: PaginationProps) => void,
}

interface State {
  loading?: boolean,
  pagination?: PaginationProps,
  data?: any[],
}

export default class FetchTable extends Component<Props, State> {
  static defaultProps = {
    backendPagingEnabled: true,
  };

  state = {
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
    },
  } as State;

  componentDidMount() {
    this.fetchAndSetState();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      this.props.url !== nextProps.url
      || !_.isEqual(this.props.query, nextProps.query)
    ) {
      this.setState({
        pagination: {
          ...this.state.pagination,
          current: 1,
        },
      }, () => {
        this.fetchAndSetState(nextProps);
      });
    }
  }

  private async fetchAndSetState(props = this.props, coverQuery?: FetchQuery) {
    this.setState({ loading: true });
    const result = await this.fetchData(props, coverQuery);
    if (result) {
      this.setState({
        data: _.get(result, 'data'),
        pagination: _.get(result, 'pagination'),
      });
    }
    this.setState({ loading: false });
  }

  private async fetchData(props = this.props, coverQuery?: FetchQuery) {
    const {
      url, query, backendPagingEnabled, processData,
    } = props;
    if (!url) return;
    const { pagination } = this.state;
    let fetchQuery = {} as FetchQuery;
    if (backendPagingEnabled) {
      fetchQuery = {
        limit: pagination!.pageSize,
        p: pagination!.current,
      };
    }
    if (query) {
      fetchQuery = {
        ...fetchQuery,
        ...query,
      };
    }
    if (coverQuery) {
      fetchQuery = {
        ...fetchQuery,
        ...coverQuery,
      };
    }

    if (props.fetchFunc) {
      return props.fetchFunc(`${url}?${queryString.stringify(fetchQuery)}`, pagination);
    } else {
      let newPagination = pagination;
      let data = [];
      try {
        const res = await request(`${url}?${queryString.stringify(fetchQuery)}`, {}, false);
        if (res) {
          if ('total' in res) {
            newPagination = {
              ...pagination,
              current: pagination!.current,
              total: res.total,
            };
            data = res.list;
          } else if (Array.isArray(res)) {
            data = res;
          }
        }

        if (processData) {
          data = await processData(data, res);
        }
      } catch (e) {
        console.log(e);
      }

      return {
        data,
        pagination: newPagination,
      };
    }
  }

  public request = async (coverQuery?: FetchQuery) => await this.fetchData(this.props, coverQuery)

  public reload = async () => await this.fetchAndSetState()

  private handleTableChange = (pagination: PaginationProps) => {
    const { handleTableChange } = this.props;
    if (handleTableChange) {
      handleTableChange.call(this, pagination);
      return;
    }
    this.setState({
      pagination: {
        ...this.state.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    }, () => {
      this.fetchAndSetState();
    });
  }

  render() {
    return (
      <Consumer>
        {
          (language) => (
            <Table
              rowKey="id"
              loading={this.state.loading}
              pagination={{
                ...this.state.pagination,
                showTotal: (total) => {
                  if (language === 'zh') {
                    return `共 ${total} 条数据`;
                  }
                  if (language === 'en') {
                    return `Total ${total} items`;
                  }
                  return null;
                },
                pageSizeOptions: config.defaultPageSizeOptions,
              }}
              rowClassName={(_record, index) => {
                if (index % 2 === 1) {
                  return 'table-row-bg';
                }
                return '';
              }}
              dataSource={this.state.data}
              onChange={this.handleTableChange}
              {...this.props.tableProps}
            />
          )
        }
      </Consumer>
    );
  }
}
