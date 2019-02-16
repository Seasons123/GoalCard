require(['jquery', 'knockout', 'bootstrap', 'uui', 'grid', 'ip'],
    function($, ko) {
        var gridObj;
        var totalPages;
        var totalElements;
        var pageNumber;
        nextKPICollection = function(id){  //htmlDialog为全局变量
            var data = {
                "size":10,
                "page":0,
                "parent.id":id
            };
            $.ajax({
                type: 'get',
                url: formUrl.QueryNextKpi,
                dataType: 'json',
                data:data,
                contentType: "application/json; charset=utf-8",
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                async: false,
                success: function (map,textStatus, request) {
                    if(map.message){
                        ip.ipInfoJump(map.message,"error");
                    }else{
                        totalPages = request.getResponseHeader("X-Page-TotalPages");
                        totalElements = request.getResponseHeader("X-Page-TotalElements");
                        pageNumber = request.getResponseHeader("X-Page-Number");

                        kpiObjectNextGlobal = map;
                        var htmlDialog = '<label class="dialogLabel">快速定位</label>';
                        htmlDialog += '<input type="text" class="form-control" id="gridSearchInput" >' ;
                        htmlDialog += '<button class="btn btn-primary top-button" type="button" onclick="gridSearch('+ id +');">查找</button>';
                        kpiObjectNextDataGlobal = []; //清空之前的数据
                        for( var i=0; i < map.length; i++){
                            var ele ={
                                "code" : map[i].kpiCode,
                                "name" : map[i].kpiName,
                                "explain" : map[i].kpiExplain,
                                "remark" : "",
                                "id":map[i].id
                            };
                            kpiObjectNextDataGlobal.push(ele);
                        }
                        htmlDialog += '<div class="demo-continer" ><div class="u-widget-body" id="mainGrid">';
                        htmlDialog += "<div u-meta='" + '{"id":"grid","type":"grid","data":"dataTables","columnMenu":false,"canDrag":false,"sortable":true,"canSwap":false,"multiSelect": false,"showNumCol": true,"columnMenu": true,"editable":false,"onDblClickFun":"onDblClickFun1","onSortFun":"sortFun","headerHeight":25,"canRowDrag":true,"onValueChange":"onValueChange1","onBeforeValueChange":"onBeforeValueChange1"}' + "'>";
                        htmlDialog += "<div options='" + '{"field":"code","dataType":"String","width":120,"title":"指标编码"}' + "'></div>";
                        htmlDialog += "<div options='" + '{"field":"name","dataType":"String","width":120,"title":"指标名称"}' + "'></div>";
                        htmlDialog += "<div options='" + '{"field":"explain","dataType":"String","width":200,"title":"指标解释"}' + "'></div>";
                        htmlDialog += "<div options='" + '{"field":"remark","dataType":"String","width":40,"title":"备注"}' + "'></div>";
                        htmlDialog += '</div>';
                        htmlDialog += "<div id='ip-grid-footer-area-mainGrid' class='text-right' style='height: 36px;'><div id='ip-grid-footer-area-sum-mainGrid' class='fl' style='margin: 10px 0 5px 5px;'></div>";
                        htmlDialog += "<div id='pagination' style='float: right;' class='u-pagination' u-meta='" + '{"type":"pagination","data":"dataTablePaging","pageList":[10,20,30,40,50],"sizeChange":"sizeChangeFun","pageChange":"pageChangeFun"}' + "'></div>";
                        htmlDialog += '</div>';
                        htmlDialog += '</div></div>';
                        htmlDialogGlobal = htmlDialog;
                    }
                }
            });
        };
        /*显示下一级待选择末级指标树*/
        showNextKPIInfo = function(value){
            var id = value.split("num")[0];
            var idNameTextArea = $("#" + value).prev().attr("id");
            var idWeightTextArea = $("#" + value).parent().next().children().attr("id");
            var idStandardTextArea = $("#" + value).parent().next().next().children().attr("id");
            var queryParams={
                parentId: id ,
                nameTextAreaId: idNameTextArea,
                weightTextAreaId: idWeightTextArea,
                standardTextAreaId: idStandardTextArea
            };//值传递
            nextKPICollection(id);
            var dlg = BootstrapDialog.show({ //用js创建dialog
                title: '末级指标选择',
                message: function() {
                    var $content = $( htmlDialogGlobal );
                    return $content;
                },
                size : BootstrapDialog.LARGE,//size为小，默认的对话框比较宽
                buttons: [{
                    label: '确定',
                    action:function(){
                        // var id = queryParams.parentId; //末级的父级指标id值
                        var idFinalKPIOld = queryParams.nameTextAreaId; //选择前末级的id值，名字单元格id
                        var weightTextAreaIdOld = queryParams.weightTextAreaId; //选择前末级权重值单元格dom元素的id
                        var standardTextAreaIdOld = queryParams.standardTextAreaId; //选择前末级评分标准单元格dom元素的id

                        gridObj = $("#grid").parent()[0]['u-meta'].grid;
                        var select = gridObj.getSelectRows(); //获取选中的行
                        var idFinalKPI = select[0].id ;//当前末级指标id值

                        if(idFinalKPI){
                            for(var i=0; i<kpiObjectNextGlobal.length; i++) {
                                if (kpiObjectNextGlobal[i].id == idFinalKPI) {
                                    var idFinalKPINew =  "row" + idFinalKPI + "num" + commonFn.random(1,100000); //有可能末级指标重复选择，保证dom元素id值唯一性
                                    var weightTextAreaIdNew =  "row" + idFinalKPI + "colWeight" + commonFn.random(1,100000);
                                    var standardTextAreaIdNew =  "row" + idFinalKPI + "colStandard" + commonFn.random(1,100000);
                                    $('#' + idFinalKPIOld).text(kpiObjectNextGlobal[i].kpiName).attr("id", idFinalKPINew);
                                    $('#' + weightTextAreaIdOld).attr("id", weightTextAreaIdNew);
                                    $('#' + standardTextAreaIdOld).attr("id", standardTextAreaIdNew);

                                    queryParams.nameTextAreaId = idFinalKPINew; //更新
                                    queryParams.weightTextAreaId = weightTextAreaIdNew; //更新
                                    queryParams.standardTextAreaId = standardTextAreaIdNew; //更新
                                    dlg.close();
                                }
                            }
                        }else{
                            ip.ipInfoJump("请选择数据!","info");
                        }
                    },
                }, {
                    label: '关闭',
                    action:function(){
                        dlg.close();
                    }
                }],
                onshown: function(){
                    var viewModel = {
                        inputGrid:[],
                        kpiObjectNextDataGlobal: ko.observable({}),
                        dataTables: new u.DataTable({
                            meta: {
                                "code": "",
                                "name": "",
                                "explain": "",
                                "remark": ""
                            }
                        }),
                        dataTablePaging: new u.DataTable({
                            meta:"",
                            totalPages:"",
                            totalRow:""
                        })
                    };
                    viewModel.dataTables.setSimpleData(kpiObjectNextDataGlobal);

                    viewModel.dataTablePaging.totalPages(totalPages);
                    viewModel.dataTablePaging.totalRow(totalElements);

                    viewModel.pageChangeFun = function(pageIndex) {
                        viewModel.dataTablePaging.pageIndex(pageIndex);
                        var total_row = viewModel.dataTablePaging.totalRow();
                        var page_size = viewModel.dataTablePaging.pageSize();
                        viewModel.getDataTableStaff(page_size, pageIndex, total_row);
                    };
                    viewModel.sizeChangeFun = function(size) {
                        viewModel.dataTablePaging.pageSize(size);
                        viewModel.dataTablePaging.pageIndex("0");
                        viewModel.pageSizeNum = size;
                        var total_row = viewModel.dataTablePaging.totalRow();
                        viewModel.getDataTableStaff(size, "0", total_row);
                    };
                    viewModel.getDataTableStaff = function(size, pageIndex) {
                        ip.loading(true, "mainGrid");
                        var search_text = $("#gridSearchInput").val();
                        var urlPath;
                        var data = {
                            "size":size,
                            "page":pageIndex,
                            "parent.id":id
                        };
                        if(search_text){
                            urlPath = formUrl.QueryNextKpi + '&kpiName%20like%20'+'%25'+search_text + '%25';
                        }else{
                            urlPath = formUrl.QueryNextKpi;
                        }

                        $.ajax({
                            type: 'get',
                            url: urlPath,
                            dataType: 'json',
                            data:data,
                            contentType: "application/json; charset=utf-8",
                            xhrFields: {
                                withCredentials: true
                            },
                            crossDomain: true,
                            async: false,
                            beforeSend: ip.loading(true),
                            success: function(map,textStatus, request) {
                                ip.loading(false, "mainGrid");
                                if(map.message){
                                    ip.ipInfoJump(map.message,"error");
                                } else {
                                    kpiObjectNextDataGlobal = []; //清空之前的数据
                                    var areaId = "mainGrid";
                                    var search_text = $("#gridSearchInput").val();
                                    for( var i=0; i < map.length; i++){
                                        var ele ={
                                            "code" : map[i].kpiCode,
                                            "name" : map[i].kpiName,
                                            "explain" : map[i].kpiExplain,
                                            "remark" : "",
                                            "id":map[i].id
                                        };
                                        kpiObjectNextDataGlobal.push(ele);
                                    }

                                    totalPages = request.getResponseHeader("X-Page-TotalPages");
                                    totalElements = request.getResponseHeader("X-Page-TotalElements");
                                    pageNumber = request.getResponseHeader("X-Page-Number");

                                    viewModel.dataTables.setSimpleData(kpiObjectNextDataGlobal, {
                                        unSelect: true
                                    });
                                    viewModel.dataTablePaging.totalPages(totalPages);
                                    viewModel.dataTablePaging.totalRow(totalElements);
                                    ip.highLightKeyWord(search_text, "red",areaId);  //key, color,gridArea
                                }
                            }
                        });
                    };
                    ko.cleanNode($('.demo-continer')[0]);
                    app = u.createApp({
                        el: '.demo-continer',
                        model: viewModel
                    });
                    //模糊查询
                    /*改进前：模糊查询gridSearch方法，借鉴了平台ip.fuzzyQuery方法（该方法是只对当前页的数据进行模糊查询），gridSearch方法的实现思路如下：重新请求一次后台方法formUrl.QueryNextKpi，查询出所有的数据；在这批数据中进行模糊条件的过滤处理；该方法缺点：只能一次性展示所有的过滤后的数据，不能进行分页
                    改进后：尝试过使用平台封装的模糊查询的方法：请求url为http://10.15.1.34:8082/fpe-kpi/api/kpi?kpiName%20like%20%25mm%25，其中 %20表示空格，%25表示%
                    遗留问题：如下只能查询一个字段kpiName，查询多个字段时用默认的&连接会取交集，应取并集，hgp研究中*/
                    gridSearch = function(id){
                        //ip.fuzzyQuery(kpiObjectNextDataGlobal, "gridSearchInput", viewModel.dataTable);
                        ip.loading(true, "mainGrid");
                        var page_size = viewModel.dataTablePaging.pageSize();
                        var data = {
                            "size":page_size,
                            "page":0,
                            "parent.id":id
                        };
                        var search_text = $("#gridSearchInput").val();
                        var urlPath = formUrl.QueryNextKpi + '&kpiName%20like%20'+'%25'+search_text + '%25';
                            $.ajax({
                            type: 'get',
                            url: urlPath,
                            dataType: 'json',
                            data:data,
                            contentType: "application/json; charset=utf-8",
                            xhrFields: {
                                withCredentials: true
                            },
                            crossDomain: true,
                            async: false,
                            beforeSend: ip.loading(true),
                            success: function(map,textStatus, request) {
                                ip.loading(false, "mainGrid");
                                if(map.message){
                                    ip.ipInfoJump(map.message,"error");
                                } else {
                                    kpiObjectNextDataGlobal = []; //清空之前的数据
                                    for( var i=0; i < map.length; i++) {
                                        var ele = {
                                            "code": map[i].kpiCode,
                                            "name": map[i].kpiName,
                                            "explain": map[i].kpiExplain,
                                            "remark": "",
                                            "id": map[i].id
                                        };
                                        kpiObjectNextDataGlobal.push(ele);
                                    }
                                    //ip.fuzzyQuery(kpiObjectNextDataGlobal, "gridSearchInput", viewModel.dataTable);
                                    var areaId = "mainGrid";
                                    var curGridHead = [];
                                    data = kpiObjectNextDataGlobal;
                                    for (var key in viewModel.dataTables.meta) {
                                         curGridHead.push(key);
                                    }
                                    totalPages = request.getResponseHeader("X-Page-TotalPages");
                                    totalElements = request.getResponseHeader("X-Page-TotalElements");
                                    pageNumber = request.getResponseHeader("X-Page-Number");

                                    viewModel.dataTables.setSimpleData(kpiObjectNextDataGlobal, {
                                        unSelect: true
                                    });
                                    viewModel.dataTablePaging.pageIndex("0");
                                    viewModel.dataTablePaging.totalPages(totalPages);
                                    viewModel.dataTablePaging.totalRow(totalElements);
                                    ip.highLightKeyWord(search_text, "red",areaId);  //key, color,gridArea

                                }
                            }
                        });
                    };
                },
            });
        };

        changeNextKPISelect= function(id,value){
            $("input[name='"+ id +"']").each(function(index,domEle){
                if(domEle.value == value){
                    $("#"+domEle.id).attr("checked",true);
                }else{
                    $("#"+domEle.id).attr("checked",false);
                }
            });
        };


    });