/**
 * Created by Toulon on 2016/7/20.
 *
 * Author infomation:
 * Email:420615326@qq.com
 * file infomation(文件功能): 可选择周或者天的组件
 */
import React, { Component, PropTypes } from 'react'

import moment from 'moment'

import './DatePicker.scss'

const monthName=["","一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

let CalendarHeader = React.createClass({

    handleLeftClick:function(){
        var newMonth = parseInt(this.props.month) - 1;
        var year = this.props.year;
        if(newMonth < 1){
            year --;
            newMonth = 12;
        }
        this.props.updateFilter(year,newMonth); // 执行父组件回调函数，改变父组件状态值
    },
    handleRightClick:function(){
        var newMonth = parseInt(this.props.month) + 1;
        var year = this.props.year;
        if( newMonth > 12 ){
            year ++;
            newMonth = 1;
        }
        this.props.updateFilter(year,newMonth);// 执行父组件回调函数，改变父组件状态值
    },
    render:function(){
        var re = new RegExp("^[a-zA-Z]*$");

        var Month_En = monthName[this.props.month];

        return(
            <div className="wp-headerborder">
                <p>{Month_En}&nbsp;</p>
                <p>{this.props.year}</p>
                {this.props.prev?<div className="wp-triangle-left"   onClick={this.handleLeftClick}>〈</div>:""}
                {this.props.next?<div className="wp-triangle-right" onClick={this.handleRightClick}>〉</div>:""}
            </div>
        )
    }
});
var CalendarBody = React.createClass({
    getMonthDays:function(){
        //根据月份获取当前天数
        var year = this.props.year,
            month = this.props.month;
        var temp = new Date(year,month,0);
        return temp.getDate();
    },
    getFirstDayWeek:function(){
        //获取当月第一天是星期几
        var year = this.props.year,
            month = this.props.month;
        var dt = new Date(year+'/'+month+'/1');
        var Weekdays = dt.getDay();
        return Weekdays;
    },

    /**
     * 过滤时间
     * @param day 渲染时的日期，表示当月第几天
     * */
    isFilter:function(day){
        let {filter,futureFilter,pastFilter} = this.props;

        let dayString = this.props.year + "-" + (this.props.month < 10 ? "0" : "") + this.props.month + "-" + (day<10?"0":"")+day; //这一天的日期，字符串
        let thisDay = moment(dayString); //这一天日期

        if(filter) {
            let thisDayOfWeek = thisDay.day();  //这一天是星期几

            if(filter.indexOf(thisDayOfWeek)<0){
                return false;
            }
        }

        //是否过滤未来
        if(futureFilter){
            if(thisDay>moment()){
                return false;
            }
        }

        //是否过滤过去 todo
        if(!isNaN(pastFilter)){  //如果pastFilter不是数字，则不予理会
            pastFilter = Math.floor(pastFilter);
            let pastTime = moment().add(-pastFilter,"years");
            if(pastTime>thisDay){
                return false;
            }
        }

        return true;
    },

    /**
     * 改变hover开始时间
     * @param item 号数
     * @param ifFliter 是否通过过滤规则
     * */
    changeHoverStart:function(item,ifFliter){
        const {changeHoverStart,year,month} = this.props;
        if(ifFliter){
            let dayString = year + "-" + (month < 10 ? "0" : "") + month + "-" + (item<10?"0":"")+item;
            changeHoverStart(dayString);
        }else{
            changeHoverStart("");
        }
    },


    /**
     * 选择某一天
     * */
    choseADay:function(item,ifFliter){
        const {changeChosen,year,month,triggerFunction} = this.props;
        if(ifFliter){
            let dayString = year + "-" + (month < 10 ? "0" : "") + month + "-" + (item<10?"0":"")+item;
            changeChosen(dayString);
            if(typeof triggerFunction=="function"){
                triggerFunction(dayString);
            }
        }
    },

    render:function(){
        const {isHoverDay,year,month,chosenTime,pickerType} = this.props;

        var arry1 = [],arry2 = [];
        var getDays = this.getMonthDays(),
            FirstDayWeek = this.getFirstDayWeek();


        let _this = this; //map中继承不到this,故保存一下

        for(var i = 0 ;i < FirstDayWeek; i++ ){
            arry1[i] = i;
        }
        for(var i = 0 ;i < getDays; i++ ){
            arry2[i] = (i+1);
        }

        var node1 = arry1.map(function(item,ind){
            return <li  key={"li"+ind}></li> // 这里不能加引号，因为要返回HTML标签，而不是html字符串，
            //这是JSX语法 HTML 语言直接写在 JavaScript 语言之中，不加任何引号。
        })
        var node2 = arry2.map(function(item,ind){
            let ifFliter = _this.isFilter(item);
            let className = ifFliter?(pickerType==="week"?"wp-week-hover":"wp-day-hover"):"wp-day-disable"; //是否过滤
            let dayString = year + "-" + (month < 10 ? "0" : "") + month + "-" + (item<10?"0":"")+item;
            if(pickerType==="week"){    //如果是周选择，则需要判断日期是否在所选日期内
                className = isHoverDay(moment(dayString))?(className+(className.indexOf("wp-week-hover")>=0?" first-week-chosen week-new-hover":" week-new-hover")):className;
            }
            else{
                (moment(dayString).calendar()===moment(chosenTime).calendar())&&(className+="  week-chosen");
            }
            return (<li key={ind} onMouseMove={(e)=>{_this.changeHoverStart(item,ifFliter)}} onClick={(e)=>{_this.choseADay(item,ifFliter)}} className={className}><span>{item}</span></li>)
        })
        return(
            <div>
                <div className="wp-weekday">
                    <ul>
                        <li>周日</li>
                        <li>周一</li>
                        <li>周二</li>
                        <li>周三</li>
                        <li>周四</li>
                        <li>周五</li>
                        <li>周六</li>
                    </ul>
                </div>
                <div className="wp-CalendarDay" ref="CalendarDay"><ul>{node1} {node2}</ul></div>
            </div>
        )
    }
});




/**
 * 周选择组件
 * 可选传入参数：
 * filter 字符串,如"1,2,3"，则表示除星期一，二，三之外的其它日期作disable处理，默认为空，则都不做处理
 * setDate 设置默认值，只需要设置周的开始日期，字符串格式，YYYY-MM-DD
 * pickerType 目前支持日选择和周选择 "day"为日 "week"为周
 * triggerFunction 选中日期后触发的事件
 * futureFilter 是否过滤未来，true or false
 * pastFilter 过滤过去，number类型，表示几年前的时间将置为无效
 * outSider 字符串，页面最外部div的id,如果点击事件发生在该div上，关闭日期组件
 * */
var DatePicker = React.createClass({

    getInitialState:function(){
        let thisMoment = moment();  //此时此刻时间
        //let inputDate = this.props.inputDate;
        let setDate = this.props.setDate||""; //用户设置时间

        let filter = this.props.filter;
        let chosenTime='';
        let regex = new RegExp('/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/');

        let firstYear = thisMoment.year(),
            firstMonth = thisMoment.month()+1,
            secondYear = thisMoment.year(),
            secondMonth= thisMoment.month()+1,
            dateShow="";

        if(secondMonth===1){
            //如果第二个控件为1月，则第一个控件年份-1
            firstYear-=1;
            firstMonth = 12;
        }else{
            firstMonth-=1;
        }

        let inputDate = thisMoment.format("YYYY-MM-DD"); //默认时间
        //若用户设置的默认时间符合规则，则设置默认值
        let inputDateWeekDay = moment(inputDate).day();//输入日期是周几
        if(setDate && regex.test(setDate)){
            if(filter){
                if(filter.indexOf(inputDateWeekDay)>0){
                    chosenTime = setDate;
                }
            }else{
                chosenTime = setDate;
            }
            //设置input框默认值，若用户设置的值不符合自己设置的filter，不予显示
            if(chosenTime && this.props.pickerType==="week"){
                let tDay=moment(chosenTime).day();
                let endDay = moment(chosenTime).add(6, "days").format("YYYY-MM-DD");
                dateShow = chosenTime+"~"+endDay;
            }else{
                dateShow = chosenTime;
            }

        }else{
            //否则将此刻时间作为默认值
            if(filter){
                if(filter.indexOf(inputDateWeekDay)>=0){
                    chosenTime=inputDate;
                }
            }else{
                chosenTime=inputDate;
            }
            if(this.props.defaultDate){
                if(this.props.pickerType && this.props.pickerType==="week"){
                    //2016/10/7，修改：只对过滤日为周一的时候作特殊处理。
                    //如果周一可选，默认选中上一周，若今日为周末，选中这一周
                    if(filter && filter.indexOf("1")>=0){
                        //2016-10-8，将默认选中周改为本周
                        //let tDay=thisMoment.day()===7?6:(6+thisMoment.day()); //开始日距今天的天数
                        let tDay=thisMoment.day()===0?6:thisMoment.day()-1; //星期日的day()为0
                        let lastWeekstartDay= moment().add(-tDay,"days").format("YYYY-MM-DD");
                        let endDay = moment(lastWeekstartDay).add(6, "days").format("YYYY-MM-DD");
                        dateShow = lastWeekstartDay+"~"+endDay;
                        chosenTime = lastWeekstartDay;
                    }
                }else{
                    dateShow = chosenTime;
                }
            }
        }



        return {
            firstYear:firstYear,
            firstMonth:firstMonth,
            secondYear:secondYear,
            secondMonth:secondMonth,        //第一个月卡片和第二个卡片的月份和年份
            hoverStart:'',                  //鼠标hover的日期
            showPicker:false,                //日期框是否显示
            chosenTime:chosenTime, //当前选中日期
            dateShow:dateShow  //显示出去的日期范围
        };
    },

    componentWillReceiveProps:function(props,newProps){
        const {filter,setDate,pickerType} = props;
        let chosenTime="",dateShow="";
        if(setDate){
            let inputDateWeekDay = moment(setDate).day();//输入日期是周几
            if(filter){
                if(filter.indexOf(inputDateWeekDay)>=0){
                    chosenTime = setDate;
                }
            }else{
                chosenTime = setDate;
            }
            //设置input框默认值，若用户设置的值不符合自己设置的filter，不予显示
            if(chosenTime && pickerType==="week"){
                let endDay = moment(chosenTime).add(6, "days").format("YYYY-MM-DD");
                dateShow = chosenTime+"~"+endDay;
            }else{
                dateShow = chosenTime;
            }

            this.setState({chosenTime:chosenTime,hoverStart:chosenTime,dateShow:dateShow});
        }
        else{
            //fixed DE-932
            if(this.props.clearDefaultDate){
                let thisMoment = moment();  //此时此刻时间
                let inputDate = thisMoment.format("YYYY-MM-DD"); //默认时间
                this.setState({chosenTime:inputDate,dateShow:""});
            }
        }

    },

    /**
     * 判断日期是否在hover选定的范围内
     * @param time 需要判断的时间，moment类型
     * @param oper 用于判断hover还是chosen
     * */
    isHoverDay:function(time,oper){
        let hoverStart = this.state.hoverStart||"",
            chosenStart = this.state.chosenTime||"",
            flag = false;

        if(hoverStart!="") {
            let endDay = moment(hoverStart).add(7, "days");
            let startDay = moment(hoverStart);
            flag = (time >= startDay && time < endDay);
        }
        if(!flag && chosenStart!=""){
            let endDay = moment(chosenStart).add(7, "days");
            let startDay = moment(chosenStart);
            flag =  (time >= startDay && time < endDay);
        }
        return flag;

    },

    /**
     * 提供给第一个组件的上一月操作
     * */
    handleFilterUpdateFirst: function(filterYear,filterMonth) {
        let firstYear = filterYear,
            firstMonth = filterMonth,
            secondYear = filterYear,
            secondMonth= filterMonth;

        if(secondMonth===12){
            //如果第一个控件为12月，则第二个控件年份+1
            secondYear+=1;
            secondMonth = 1;
        }else{
            secondMonth+=1;
        }

        this.setState({
            firstYear : firstYear,
            firstMonth : firstMonth,
            secondYear : secondYear,
            secondMonth : secondMonth
        });
    },

    /**
     * 提供给第二个组件的下一月操作
     * */
    handleFilterUpdateSecond: function(filterYear,filterMonth) {
        let firstYear = filterYear,
            firstMonth = filterMonth,
            secondYear = filterYear,
            secondMonth= filterMonth;

        if(secondMonth===1){
            //如果第二个控件为1月，则第一个控件年份-1
            firstYear-=1;
            firstMonth = 12;
        }else{
            firstMonth-=1;
        }

        this.setState({
            firstYear : firstYear,
            firstMonth : firstMonth,
            secondYear : secondYear,
            secondMonth : secondMonth
        });
    },

    /**
     * 改变hover的日期
     * */
    changeHoverStart:function(momentString){
        this.setState({hoverStart:momentString});
    },

    /**
     * 改变弹出框状态
     * */
    changeShowState(event){
        let _this = this;
        let status=!this.state.showPicker;
        this.setState({showPicker:status});
        if(typeof this.props.hideOthers==="function"){
            this.props.hideOthers();
        }
        if(status && this.props.outSider){
            $("#"+this.props.outSider).click(function(ev){
                let domNode = $('.wp-pop-container'),
                    domInput = $('.wp-show-box');

                if(domNode.length>0){
                    if(domNode.has(ev.target).length === 0 && domInput.has(ev.target).length===0 && !jQuery(ev.target).hasClass("wp-show-box")){
                        _this.changeShowState();
                    }
                }
            });

        }else{
            this.props.outSider && ($("#" + this.props.outSider).click = null);
        }
    },

    /**
     * 改变选择时间
     * @time 希望改变的日期
     * */
    changeChosen(time){
        //todo..判断time是否合法
        let pickerType = this.props.pickerType||"day";
        let dateShow='';
        if(pickerType==="week"){
            let endDay = moment(time).add(6, "days").format("YYYY-MM-DD");
            dateShow = time+"~"+endDay;
        }else{
            dateShow = time;
        }


        this.setState({chosenTime:time,dateShow:dateShow,showPicker:false});
    },


    render:function(){
        const {firstYear,firstMonth,secondYear,secondMonth,hoverStart,showPicker,dateShow,chosenTime} = this.state;
        const {pickerType,filter,futureFilter,pastFilter} = this.props;
        return(
            <div className="week-picker2">
                <div className="wp-show-box" onClick={(e)=>{this.changeShowState(e)}}>
                    <span className="wp-show-date show-out-span">{dateShow}</span>
                </div>
                <div className={showPicker?"wp-pop-container":"hide"}>
                    <div className="wp-calendarBorder wp-first-month">
                        <CalendarHeader
                            year = {firstYear}
                            month = {firstMonth}
                            updateFilter={this.handleFilterUpdateFirst}
                            prev={true}
                        />
                        <CalendarBody
                            year = {firstYear}
                            month = {firstMonth}
                            filter={filter}
                            isHoverDay={this.isHoverDay}
                            hoverStart={hoverStart}
                            changeChosen={this.changeChosen}
                            changeHoverStart = {this.changeHoverStart}
                            pickerType={pickerType}
                            triggerFunction={this.props.triggerFunction}
                            chosenTime={chosenTime}
                            futureFilter={futureFilter}
                            pastFilter={pastFilter} />
                    </div>
                    <div className="wp-calendarBorder wp-second-month">
                        <CalendarHeader
                            year = {secondYear}
                            month = {secondMonth}
                            updateFilter={this.handleFilterUpdateSecond}
                            next={true}
                        />
                        <CalendarBody
                            year = {secondYear}
                            month = {secondMonth}
                            filter={filter}
                            isHoverDay={this.isHoverDay}
                            hoverStart={hoverStart}
                            changeChosen={this.changeChosen}
                            pickerType={pickerType}
                            changeHoverStart = {this.changeHoverStart}
                            triggerFunction={this.props.triggerFunction}
                            chosenTime={chosenTime}
                            futureFilter={futureFilter}
                            pastFilter={pastFilter} />
                    </div>
                </div>

            </div>


        )
    }
})


export default DatePicker