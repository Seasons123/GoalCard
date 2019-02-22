//走网关用端口8081，直接走后台服务用端口8000
var sever = "1";
var formUrl = {} ;
switch (sever){
    case "0":
        formUrl = {
            "KpiTplDetail": '../data/target.json',
            "QueryNextKpi": '../data/nextKpi.json',
            "TaskKpi": '../data/saveTaskKpiResponse.json'
        };
        break ;
    case  "1": /*年度目标测试数据*/
        formUrl = {
            "KpiTplDetail": 'http://10.15.1.34:8082/fpe-kpi/api/KpiTplDetail?',
            "QueryNextKpi": 'http://10.15.1.34:8082/fpe-kpi/api/Kpi?',
            "TaskKpi": 'http://10.10.65.43:8081/df-peeval/api/TaskKpi?'
        };
        break ;
    case  "2":   /*中期目标测试数据*/
        formUrl = {
            "KpiConfig": 'http://10.15.1.34:8081/df-pe/api/KpiConfig?',
            "QueryNextKpi": 'http://10.15.1.34:8081/df-pe/api/Kpi?',
            "TaskKpi": 'http://10.15.1.34:8081/df-pe/api/TaskKpi?'
        };
}