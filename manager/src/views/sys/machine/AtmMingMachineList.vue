<template>
  <div>
    <Card>
      <Form
        ref="searchForm"
        @keydown.enter.native="handleSearch"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
      >
        <Form-item label="矿机名称" prop="buyerName">
          <Input
            type="text"
            v-model="searchForm.name"
            placeholder="请输入矿机名称"
            clearable
            style="width: 160px"
          />
        </Form-item>

<!--        <Form-item label="订单类型" prop="orderType">-->
<!--          <Select-->
<!--            v-model="searchForm.orderPromotionType"-->
<!--            placeholder="请选择"-->
<!--            clearable-->
<!--            style="width: 160px"-->
<!--          >-->
<!--            <Option value="NORMAL">普通订单</Option>-->
<!--            <Option value="PINTUAN">拼团订单</Option>-->
<!--            <Option value="GIFT">赠品订单</Option>-->
<!--            <Option value="POINTS">积分订单</Option>-->
<!--            <Option value="KANJIA">砍价订单</Option>-->
<!--          </Select>-->
<!--        </Form-item>-->
<!--        <Form-item label="下单时间">-->
<!--          <DatePicker-->
<!--            v-model="selectDate"-->
<!--            type="datetimerange"-->
<!--            format="yyyy-MM-dd"-->
<!--            clearable-->
<!--            @on-change="selectDateRange"-->
<!--            placeholder="选择起始时间"-->
<!--            style="width: 160px"-->
<!--          ></DatePicker>-->
<!--        </Form-item>-->
<!--        <Form-item label="订单状态" prop="orderStatus">-->
<!--          <Select-->
<!--            v-model="searchForm.orderStatus"-->
<!--            placeholder="请选择"-->
<!--            clearable-->
<!--            style="width: 160px"-->
<!--          >-->
<!--            <Option value="UNPAID">未付款</Option>-->
<!--            <Option value="PAID">已付款</Option>-->
<!--            <Option value="UNDELIVERED">待发货</Option>-->
<!--            <Option value="DELIVERED">已发货</Option>-->
<!--            <Option value="COMPLETED">已完成</Option>-->
<!--            <Option value="TAKE">待核验</Option>-->
<!--            <Option value="CANCELLED">已取消</Option>-->
<!--            <Option value="STAY_PICKED_UP">待自提</Option>-->
<!--          </Select>-->
<!--        </Form-item>-->
        <Button
          @click="handleSearch"
          type="primary"
          icon="ios-search"
          class="search-btn"
          >搜索</Button
        >
        <Button
          @click="add"
          type="primary"
          icon="ios-add"
          class="search-btn"
          >新增</Button>
      </Form>

<!--      <div class="order-tab">-->
<!--        <div v-for="(item,index) in orderStatus" :key="index" :class="{'current': currentStatus === item.value}" @click="orderStatusClick(item)">-->
<!--          {{item.title}}-->
<!--        </div>-->
<!--      </div>-->

      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
      ></Table>

      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10, 20, 50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import * as API_Order from "@/api/atmMingMachine.js";
import JsonExcel from "vue-json-excel";
export default {
  name: "orderList",
  components: {
    "download-excel": JsonExcel,
  },
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
        startDate: "", // 起始时间
        endDate: "", // 终止时间
        orderType: "",
        orderSn: "",
        buyerName: "",
        orderStatus: "",
      },
      selectDate: null,
      columns: [
        {
          title: "矿机名称",
          key: "name",
          minWidth: 130,
          tooltip: true,
        },
        {
          title: "矿机价格",
          key: "price",
          minWidth: 100,
          tooltip: true,
          render: (h, params) => {
            return h("priceColorScheme", {props:{value:params.row.price,color:this.$mainColor}} );
          },
        },
        {
          title: "限制购买数量",
          key: "limitNum",
          minWidth: 240,
          tooltip: true,
        },
        {
          title: "矿机有效时长",
          key: "limitHours",
          minWidth: 240,
          tooltip: true,
        },
        {
          title: "每小时产出",
          key: "hourPoints",
          minWidth: 240,
          tooltip: true,
        },
        {
          title: "总产出",
          key: "sumPoints",
          minWidth: 240,
          tooltip: true,
        },
        {
          title: "算力",
          key: "power",
          minWidth: 240,
          tooltip: true,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "Button",
              {
                props: { type: "info", size: "small" },
                style: { marginRight: "5px" },
                on: {
                  click: () => {
                    this.detail(params.row);
                  },
                },
              },
              "查看"
            );
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      orderStatus: [
        {title: '全部', value: ''},
        {title: '未付款', value: 'UNPAID'},
        {title: '已付款', value: 'PAID'},
        {title: '待发货', value: 'UNDELIVERED'},
        {title: '已发货', value: 'DELIVERED'},
        {title: '待核验', value: 'TAKE'},
        {title: '待自提', value: 'STAY_PICKED_UP'},
        {title: '已完成', value: 'COMPLETED'},
        {title: '已取消', value: 'CANCELLED'},

      ],
      currentStatus: ''
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      API_Order.getAtmMingMachine(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
    // 跳转详情页面
    detail(v) {
      let id = v.id;
      console.log(id);
      this.$options.filters.customRouterPush({
        name: "atmMingMachine",
        query: { id: id },
      })
    },
    //跳转添加页面
    add() {
      this.$options.filters.customRouterPush({
        name: "atmMingMachine",
      });
    },
    // 导出订单
    async exportOrder() {
      const params = JSON.parse(JSON.stringify(this.searchForm));
      params.pageNumber = 1;
      params.pageSize = 10000;
      const result = await API_Order.getOrderList(params);
      if (result.success) {
        if (result.result.records.length === 0) {
          this.$Message.warning("暂无待发货订单");
          return [];
        } else {
          return result.result.records;
        }
      } else {
        this.$Message.warning("导出订单失败，请重试");
      }
    },
    // 订单筛选
    orderStatusClick(item) {
      this.currentStatus = item.value;
      this.searchForm.orderStatus = item.value;
      this.getDataList();
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.export {
  margin: 10px 20px 10px 0;
}
.export-excel-wrapper {
  display: inline;
}
.order-tab {
  width: 950px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0;
  padding: 0 10px;
  margin-bottom: 10px;
  div {
    text-align: center;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .current {
    background-color: #ffffff;
  }
}
</style>
