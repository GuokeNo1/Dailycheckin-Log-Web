var Data = {
    list:[
        {type:"time",time:"10:00"},
        {type:"me",message:"AUOK"},
        {type:"script",name:"BBOB",message:"I'm Fine"}
    ],
    names:[],
    custom_args:{
        days: 0,
        name: "all"
    }
};
var messages = new Vue(
    {
        el: '.body',
        data: Data,
        methods: {
            _7Day: function(index){
                Data.custom_args.days = 7
                if(Data.list[index].used){
                    return;
                };
                tools.send_message("7天");
                Data.list.push({type:"select_script",days: Data.custom_args.days});
            },
            _31Day: function(index){
                if(Data.list[index].used){
                    return;
                }
                Data.custom_args.days = 31;
                tools.send_message("31天");
                Data.list.push({type:"select_script",days: Data.custom_args.days});
            },
            select_name: function(days,name,index){
                if(Data.list[index].used){
                    return;
                }
                console.log(days,name);
                tools.send_message(name);
                var td = new Date();
                var sd = new Date(new Date(td.getFullYear(),td.getMonth(),td.getDate()) - 1000*60*60*24*days);
                var data = "start="+sd.getFullYear()+"-"+(sd.getMonth()+1)+"-"+sd.getDate();
                if(name!="all"){
                    data+="&name="+name;
                }
                console.log(data);
                axios.post("./action/getLog.php",data).then(function(e){
                    var result = e.data;
                    if(result.code == 200){
                        var time = "";
                        for(var i=0;i<result.list.length;i++){
                            var tt = tools.toDateString(new Date(result.list[i].time));
                            if(time!=tt){
                                Data.list.push({type: "time",time: tt});
                                time = tt;
                            }
                            Data.list.push({type:"script",name:result.list[i].name,message:result.list[i].message});
                            if(Data.names.indexOf(result.list[i].name)<0){
                                Data.names.push(result.list[i].name);
                            }
                        }
                        console.log(result);
                    }else{
                        Data.list.push({type: "time",time: tools.toDateString(new Date())});
                        Data.list.push({type: "system_report",message:"系统出现点小问题,Code:"+result.code});
                    }
                });
            },
            used: function(index){
                console.log(index);
                Data.list[index].used = true;
            }
        },
        updated: function(){
            var head = document.getElementsByClassName("body")[0];
            head.scrollTop = head.scrollHeight;
        }
    }
);
var buttons = new Vue({
    el: ".buttons",
    data: Data,
    methods: {
        flashLog: function(e){
            tools.send_message("刷新日志");
            Data.list.push({type:"select_days"});
        },
        statisticalLog: function(e){
            tools.send_message("统计日志");
            axios.post("./action/statisticalLog.php",{}).then(function(e){
                var result = e.data;
                var show_data = {};
                if(result.code==200){
                    console.log(result.list);
                    for(var i=0;i<result.list.length;i++){
                        var isset = false;
                        for(var k in show_data){
                            if(result.list[i].script==k){
                                isset = true;
                                break;
                            }
                        }
                        if(isset){
                            show_data[result.list[i].script].push(result.list[i].date);
                        }else{
                            show_data[result.list[i].script] = [result.list[i].date];
                        }
                    }
                    for(var k in show_data){
                        Data.list.push({type:"script",name:k,message:"本脚本自"+show_data[k][0]+"以来共计运行了"+show_data[k].length+"天"});
                    }
                }else{
                    Data.list.push({type: "time",time: tools.toDateString(new Date())});
                    Data.list.push({type: "system_report",message:"系统出现点小问题,Code:"+result.code});
                }
                
            });
        }
    }
})
var tools = {
    isToday: function(date){
        var today = new Date();
        return today.getFullYear()==date.getFullYear() && today.getMonth()==date.getMonth() && today.getDate()==date.getDate();
    },
    toDateString: function(date){
        if(this.isToday(date)){
            return date.getHours() + ":" +date.getMinutes();
        }else{
            return date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() + " " + date.getHours() + ":" +date.getMinutes();
        }
    },
    system_report: function(message){
        Data.list.push({type:"system_report","message":message});
    },
    send_message: function(message){
        Data.list.push({type:"me",message: message})
    }
};
// init
axios.post("./action/getLog.php",{}).then(function(e){
    var result = e.data;
    Data.list.splice(0,Data.list.length);
    if(result.code == 200){
        Data.list.push({type: "time",time: tools.toDateString(new Date(result.list[0].time))});
        for(var i=0;i<result.list.length;i++){
            Data.list.push({type:"script",name:result.list[i].name,message:result.list[i].message});
            if(Data.names.indexOf(result.list[i].name)<0){
                Data.names.push(result.list[i].name);
            }
        }
    }else{
        Data.list.push({type: "time",time: tools.toDateString(new Date())});
        Data.list.push({type: "system_report",message:"系统出现点小问题,Code:"+result.code});
    }
});