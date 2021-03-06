/* eslint-disable prefer-template */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Button, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import DateInput from '../../DateInput';
import * as config from '../config';
import * as util from '../util';


export default class GlobalOperationbar extends Component {
  static propTypes = {
    refreshVisible: PropTypes.bool,
    now: PropTypes.string,
    start: PropTypes.string,
    end: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    refreshVisible: true,
    now: '',
    start: '',
    end: '',
    onChange: _.noop,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleRefresh = () => {
    // todo 如果用户选择的是 "其他" 时间，然后再点击 "刷新" 按钮，这时候 end 就会被强制更新到 now 了，这块有待考虑下怎么处理
    const { onChange, start, end } = this.props;
    const now = moment();
    const nowTs = now.format('x');
    let newStart = start;
    let newEnd = end;

    if (start && end) {
      newStart = (Number(nowTs) - Number(end)) + Number(start) + '';
      newEnd = nowTs;
    }

    onChange({
      now: nowTs,
      start: newStart,
      end: newEnd,
    });
  }

  handleTimeOptionChange = (val) => {
    const { onChange } = this.props;
    const now = this.props.now ? moment(Number(this.props.now)) : moment();
    const newNow = typeof now === 'string' ? now : now.clone().format('x');
    let start = this.props.start || now.clone().subtract(3600001, 'ms').format('x');
    let end = this.props.end || now.clone().format('x');

    if (val !== 'custom') {
      start = moment(Number(now)).subtract(Number(val), 'ms').format('x');
      end = moment(Number(now)).format('x');
    } else {
      start = moment(Number(start)).format('x');
      end = moment().format('x');
    }

    onChange({
      now: newNow,
      start,
      end,
    });
  }

  handleDateChange = (key, d) => {
    let { start, end } = this.props;

    if (_.isDate(d)) {
      const ts = moment(d.getTime()).format('x');

      if (key === 'start') {
        start = ts;
      }
      if (key === 'end') {
        end = ts;
      }

      this.props.onChange({
        start,
        end,
      });
    }
  }

  render() {
    const { now, start, end } = this.props;
    let timeVal;

    if (now && start && end) {
      timeVal = now === end ? util.getTimeLabelVal(start, end, 'value') : 'custom';
    }

    const datePickerStartVal = start ? moment(Number(start)).format(config.timeFormatMap.moment) : null;
    const datePickerEndVal = end ? moment(Number(end)).format(config.timeFormatMap.moment) : null;

    return (
      <div className="global-operationbar-warp">
        {
          this.props.refreshVisible ?
            <Button onClick={this.handleRefresh} style={{ marginRight: 8 }}>
              <FormattedMessage id="graph.refresh" />
            </Button> : null
        }
        <span>
          <Select
            style={{ width: 80 }}
            value={timeVal}
            onChange={this.handleTimeOptionChange}
            placeholder="无"
          >
            {
              _.map(config.time, (o) => {
                return (
                  <Select.Option key={o.value} value={o.value}>
                    <FormattedMessage id={o.label} />
                  </Select.Option>
                );
              })
            }
          </Select>
          {
            timeVal === 'custom' ?
              [
                <DateInput key="datePickerStart"
                  format={config.timeFormatMap.antd}
                  style={{
                    width: 190,
                    marginLeft: 5,
                  }}
                  value={datePickerStartVal}
                  onChange={d => this.handleDateChange('start', d)}
                />,
                <span key="datePickerDivider" style={{ paddingLeft: 5, paddingRight: 5 }}>-</span>,
                <DateInput key="datePickerEnd"
                  format={config.timeFormatMap.antd}
                  style={{
                    width: 190,
                  }}
                  value={datePickerEndVal}
                  onChange={d => this.handleDateChange('end', d)}
                />,
              ] : false
          }
        </span>
      </div>
    );
  }
}
