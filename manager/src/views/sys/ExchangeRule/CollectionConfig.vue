<template>
  <div class="search">
    <Card>
      <Row>
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">

          <Form-item label="收款码相片" prop="collectImg">
            <img :src="searchForm.collectImg" width="160" height="100">
            <!-- 上传 -->
            <div class="tpl">
              <Upload :on-success="handleUpload" name="file" style="width:50%; height:400px;" accept="image/jpeg,image/jpg,image/png"
                      multiple type="jpg | jpeg | png" :action="action" :headers="accessToken" width="160" height="100">
                <div style="padding: 50px 0">
                  <Icon type="ios-cloud-upload" size="10" style="color: #3399ff"></Icon>
                  <h2>选择或拖拽文件上传</h2>
                </div>
              </Upload>
            </div>
          </Form-item>

          <Form-item label="收款方地址" prop="collectUrl">
            <Input type="text" v-model="searchForm.collectUrl" placeholder="请输入溢价区最低价格" clearable
                   style="width: 200px"/>
          </Form-item>
          <Form-item label="收款方名称" prop="collectName">
            <Input type="text" v-model="searchForm.collectName" placeholder="请输入交易类型" clearable
                   style="width: 200px"/>
          </Form-item>
          <!-- 提交 -->
          <Form-item>
            <Button type="primary" @click="updateRuleSubmit">更新规则</Button>
          </Form-item>
        </Form>
      </Row>
    </Card>
  </div>
</template>
<script>
import multipleMap from "@/components/map/multiple-map";
import * as API_Rule from "@/api/exchangeRule.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import {uploadFile} from "@/api/index";
export default {
  name: "CollectionConfig",
  components: {
    multipleMap,
    ossManage,
  },
  data() {
    return {
      file: "",
      action: uploadFile, // 上传接口
      accessToken: {}, // 验证token
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
        id: "",
      },
      previewImage: "",
      picModelFlag: false, // 选择图片
      form: {}, // 表单数据
      ruleValidate: {}, //修改验证
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

    //查询规则列表
    getData() {
      API_Rule.getLastExchangeRule().then((res) => {
        this.searchForm = res.result;
        if (res.result.records) {
          this.loading = false;
          this.init(res.result.records);
          this.total = res.result.total;
        }
      });
    },
    // 上传数据
    handleUpload(file) {
      this.upload(file);
      return false;
    },
    /**
     * 上传文件
     */
    async upload(res) {
      if (res.success) {
        this.searchForm.collectImg = res.result;
      }
    },
    //添加会员提交
    updateRuleSubmit() {
      this.$refs.searchForm.validate((valid) => {
        if (valid) {
          //string转double
          this.searchForm.type = this.orderStatusList3(this.searchForm.typeName);

          API_Rule.updateExchangeRule(this.searchForm).then((res) => {
            if (res.result) {
              this.getData();
              this.$Message.success("修改成功！");
            }
          });
        }
      });
    },
  },
  mounted() {
    this.getData();
    this.accessToken.accessToken = "admin";
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
