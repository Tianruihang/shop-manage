<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
          <Form-item label="会员名称" prop="username">
            <Input type="text" v-model="searchForm.username" placeholder="请输入会员名称" clearable
                   style="width: 200px"/>
          </Form-item>

          <Form-item label="会员昵称" prop="nickName">
            <Input type="text" v-model="searchForm.nickName" placeholder="请输入会员昵称" clearable
                   style="width: 200px"/>
          </Form-item>

          <Form-item label="联系方式" prop="mobile">
            <Input type="text" v-model="searchForm.mobile" placeholder="请输入会员联系方式" clearable
                   style="width: 200px"/>
          </Form-item>
          <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button>
        </Form>
      </Row>

      <Table :loading="loading" border :columns="columns" class="mt_10" :data="data" ref="table"></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
              @on-page-size-change="changePageSize" :page-size-opts="[10, 20, 50]" size="small" show-total show-elevator
              show-sizer></Page>
      </Row>
    </Card>

    <Modal width="1200px" v-model="picModelFlag">
      <ossManage @callback="callbackSelected" ref="ossManage"/>
    </Modal>
    <Modal title="View Image" v-model="visible">
      <img :src="previewImage" v-if="visible" style="width: 100%">
    </Modal>
    <multipleMap ref="map" @callback="selectedRegion"/>
  </div>
</template>

<script>
import multipleMap from "@/components/map/multiple-map";
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import * as RegExp from "@/libs/RegExp.js";
import {getMemberAuthListData, updateAuthStatus} from "../../../api/member";

export default {
  name: "member",
  components: {
    multipleMap,
    ossManage,
  },
  data() {
    return {
      defaultPic: require('@/assets/default.png'),
      descTitle: "", // modal标题
      descFlag: false, //编辑查看框
      loading: true, // 表单加载状态
      addFlag: false, // modal显隐控制
      visible: false,
      searchForm: {
        // 请求参数
        pageNumber: 1,
        pageSize: 10,
        order: "desc",
        username: "",
        mobile: "",
        disabled: "OPEN",
      },
      previewImage: "",
      picModelFlag: false, // 选择图片
      form: {}, // 表单数据
      ruleValidate: {}, //修改验证
      columns: [
        {
          title: "会员名称",
          key: "username",
          tooltip: true,
        },
        {
          title: "会员昵称",
          key: "nickName",
          tooltip: true,
        },
        {
          title: "联系方式",
          width: 130,
          key: "mobile",
          render: (h, params) => {
            if (params.row.mobile == null) {
              return h("div", [h("span", {}, "")]);
            } else {
              return h("div", [h("span", {}, params.row.mobile)]);
            }
          },
        },
        {
          title: "身份证号",
          key: "createTime",
          width: 180,
          render: (h, params) => {
            return h(
                "div",
                {},
                params.row.idCardNum == void 0 ? "0" : params.row.idCardNum
            );
          },
        },
        {
          title: "身份证首页",
          align: "left",
          width: 100,
          render: (h, params) => {
            return h(
                "div", [
                  h(
                      "img", {
                        style: {
                          // verticalAlign: "middle",
                          width: "40px",
                          height: "80px",
                        },
                        attrs: {
                          src: params.row.onImg
                        },
                        on: {
                          click: () => {
                            this.imgDetail(params.row.onImg);
                          }
                        }
                      })
                ]
            )

          },
        },

        {
          title: "身份证反页",
          align: "left",
          width: 100,
          render: (h, params) => {
            return h(
                "div", [
                  h(
                      "img", {
                        style: {
                          // verticalAlign: "middle",
                          width: "40px",
                          height: "80px",
                        },
                        attrs: {
                          src: params.row.backImg
                        },
                        on: {
                          click: () => {
                            this.imgDetail(params.row.backImg);
                          }
                        }
                      })
                ]
            )
          },
        },
        {
          title: "手持身份证",
          align: "left",
          width: 100,
          render: (h, params) => {
            return h(
                "div", [
                  h(
                      "img", {
                        style: {
                          // verticalAlign: "middle",
                          width: "40px",
                          height: "80px",
                        },
                        attrs: {
                          src: params.row.authImg
                        },
                        on: {
                          click: () => {
                            this.imgDetail(params.row.authImg);
                          }
                        }
                      })
                ]
            )
          },
        },
        {
          title: "支付宝页面",
          align: "left",
          width: 100,
          render: (h, params) => {
            return h(
                "div", [
                  h(
                      "img", {
                        style: {
                          // verticalAlign: "middle",
                          width: "40px",
                          height: "80px",
                        },
                        attrs: {
                          src: params.row.zfbImg
                        },
                        on: {
                          click: () => {
                            this.imgDetail(params.row.zfbImg);
                          }
                        }
                      })
                ]
            )
          },
        },
        {
          title: "微信页面",
          align: "left",
          width: 100,
          render: (h, params) => {
            return h(
                "div", [
                  h(
                      "img", {
                        style: {
                          // verticalAlign: "middle",
                          width: "40px",
                          height: "80px",
                        },
                        attrs: {
                          src: params.row.weChatImg
                        },
                        on: {
                          click: () => {
                            this.imgDetail(params.row.weChatImg);
                          }
                        }
                      })
                ]
            )
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          fixed: "right",
          render: (h, params) => {
            return h(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent: "center",
                  },
                },
                [
                  h(
                      "Button",
                      {
                        props: {
                          size: "small",
                          type: "error",
                        },
                        style: {
                          marginRight: "5px",
                          display: params.row.status === 0 ? "block" : "none",
                        },
                        on: {
                          click: () => {
                            this.accessAuth(params.row, 1);
                          },
                        },
                      },
                      "通过"
                  ),
                  h(
                      "Button",
                      {
                        props: {
                          size: "small",
                          type: "error",
                        },
                        style: {
                          marginRight: "5px",
                          display: params.row.status === 0 ? "block" : "none",
                        },
                        on: {
                          click: () => {
                            this.accessAuth(params.row, 2);
                          },
                        },
                      },
                      "退回"
                  ),
                ]
            );
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
      selectMember: [], //保存选中的用户
    };
  },
  props: {
    // 是否为选中模式
    selectedMember: {
      type: Boolean,
      default: false,
    },
    // 已选择用户数据
    selectedList: {
      type: null,
      default: () => {
        return [];
      },
    },
  },
  watch: {
    selectedList: {
      handler(val) {
        this.$set(this, "selectMember", JSON.parse(JSON.stringify(val)));
        this.init(this.data);
        // 将父级数据与当前组件数据进行匹配
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 回调给父级
    callback(val, index) {
      this.selectMember.forEach(item => {
        item.___selected = false
      })
      this.$set(val, "___selected", !val.___selected);
      console.log(val.___selected);
      console.log(this.selectMember);
      let findUser = this.selectMember.find((item) => {
        return item.id == val.id;
      });
      // 如果没有则添加
      if (!findUser) {
        this.selectMember.push(val);
      } else {
        // 有重复数据就删除
        this.selectMember.map((item, index) => {
          if (item.id == findUser.id) {
            this.selectMember.splice(index, 1);
          }
        });
      }

      this.$emit("callback", val);
    },
    // 初始化信息
    init(data) {
      data.forEach((item) => {
        if (this.selectMember.length != 0) {
          this.selectMember.forEach((member) => {
            if (member.id == item.id) {
              this.$set(item, "___selected", true);
            }
          });
        } else {
          this.$set(item, "___selected", false);
        }
      });
      this.data = data;
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.searchForm.pageNumber = 1;
      this.getData();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getData();
    },
    //查看详情修改
    editPerm(val) {
      this.descTitle = `查看用户 ${val.username}`;
      this.descFlag = true;

      this.getMemberInfo(val.id);
    },
    addMember() {
      this.addFlag = true;
      this.$refs.addMemberForm.resetFields();
    },
    /**
     * 查询查看会员详情
     */
    getMemberInfo(id) {
      API_Member.getMemberInfoData(id).then((res) => {
        if (res.result) {
          this.$set(this, "form", res.result);
        }
      });
    },

    //查询会员审核列表
    getData() {
      API_Member.getMemberAuthListData(this.searchForm).then((res) => {
        if (res.result.records) {
          this.loading = false;
          this.init(res.result.records);
          this.total = res.result.total;
        }
      });
    },
    // 选中的图片
    callbackSelected(val) {
      this.picModelFlag = false;
      this.form.face = val.url;
    },
    //添加会员提交
    addMemberSubmit() {
      this.addMemberForm.password = this.md5(this.addMemberForm.password);
      this.$refs.addMemberForm.validate((valid) => {
        if (valid) {
          API_Member.addMember(this.addMemberForm).then((res) => {
            if (res.result) {
              this.$refs.addMemberForm.resetFields();
              this.getData();
              this.$Message.success("添加成功！");
              this.addFlag = false;
            }
          });
        }
      });
    },

    // 选中的地址
    selectedRegion(val) {
      if (val.type === 'select') {
        const paths = val.data.map(item => item.name).join(',')
        const ids = val.data.map(item => item.id).join(',')

        this.$set(this.form, 'region', paths)
        this.$set(this.form, 'regionId', ids)

      } else {
        this.$set(this.form, 'region', val.data.addr)
        this.$set(this.form, 'regionId', val.data.addrId)
      }
    },
    //查看会员
    detail(row) {
      this.$options.filters.customRouterPush({name: "member-detail", query: {id: row.id}})
    },

    //审核通过
    accessAuth(v, k) {
      let params = {
        id: v.pointId,
        status: k,
      };
      this.$Modal.confirm({
        title: "提示",
        content: "<p>审核此会员？</p>",
        onOk: () => {
          API_Member.updateAuthStatus(params).then((res) => {
            if (res.success) {
              this.$Message.success("审核成功");
              this.getData();
            } else {
              // this.$Message.error(res.message);
            }
          });
        },
      });
    },
    //图片展示
    imgDetail(v) {
      this.visible = true;
      this.previewImage = v
    },
    // 提交修改数据
    handleSubmitModal() {
      const {nickName, sex, username, face, newPassword, id, regionId, region} = this.form;
      let time = new Date(this.form.birthday);
      let birthday = this.form.birthday === undefined ? '' :
          time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
      let submit = {
        regionId,
        region,
        nickName,
        username,
        sex,
        birthday,
        face,
        id
      };

      if (newPassword) {
        submit.password = this.md5(newPassword);
      }
      API_Member.updateMember(submit).then((res) => {
        if (res.result) {
          this.$Message.success("修改成功！");
          this.getData();
        }
      });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
<style lang="scss" scoped>
/deep/ .ivu-table-wrapper {
  width: 100%;
}

/deep/ .ivu-card {
  width: 100%;
}

.face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
</style>
