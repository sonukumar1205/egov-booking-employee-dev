import React, { Component } from "react";
import { Tabs, Card, TextField, Icon, Button } from "components";
import Grid from '@material-ui/core/Grid';
import get from "lodash/get";

import FloatingActionButton from "material-ui/FloatingActionButton";
import { Complaints, SortDialog, Screen } from "modules/common";
import { fetchApplications } from "egov-ui-kit/redux/complaints/actions";
import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import Label from "egov-ui-kit/utils/translationNode";
import { transformComplaintForComponent } from "egov-ui-kit/utils/commons";
import { httpRequest } from "egov-ui-kit/utils/api";
import { connect } from "react-redux";
import orderby from "lodash/orderBy";
import { toggleSnackbarAndSetText } from "egov-ui-kit/redux/app/actions";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { getTenantId } from "egov-ui-kit/utils/localStorageUtils";
import CountDetails from "./components/CountDetails";
import "./index.css";
import ShowField from "./showField";
//import ShowField from "C:/latest_project/frontend/web/rainmaker/packages/employee/src/modules/employee/reports/showField";

class AllRequests extends Component {
  state = {
    complaintNo: "",
    fromDate: '',
    toDate: '',
    mobileNo: "",
    complaints: [],
    search: false,
    value: 0,
    sortPopOpen: false,
    errorText: ""
  };
  style = {
    iconStyle: {
      height: "30px",
      width: "30px"
    }
  };
  // const compainsData=[];
  componentDidMount = async () => {
    let {
      role,
      userInfo,
      numCSRComplaint,
      numEmpComplaint,
      renderCustomTitle,
      prepareFinalObject
    } = this.props;
    console.log('this.props userInfo', userInfo)
    let rawRole =
      userInfo && userInfo.roles && userInfo.roles[0].code.toUpperCase();
    //const numberOfComplaints = role === "employee" ? numEmpComplaint : role === "csr" ? numCSRComplaint : 0;
    if (rawRole === "PGR-ADMIN") {
      this.props.history.push("/report/rainmaker-pgr/DepartmentWiseReport");
    } else {
      let { fetchApplications } = this.props;

      let complaintCountRequest = [
        { key: 'uuId', value: userInfo.uuid },

        { key: "tenantId", value: getTenantId() },
        {
          key: "status",
          value:
            role === "csr"
              ? "assigned,open,reassignrequested"
              : role === "eo"
                ? "escalatedlevel1pending,escalatedlevel2pending"
                : "assigned,reassignrequested"
        }
      ];
      // let payloadCount = await httpRequest(
      //   "rainmaker-pgr/v1/requests/_count",
      //   "_search",
      //   complaintCountRequest
      // );
      // console.log('payloadCount', payloadCount)
      // if (role === "csr") {
      //   payloadCount
      //     ? payloadCount.count
      //       ? renderCustomTitle(payloadCount.count)
      //       : renderCustomTitle("0")
      //     : renderCustomTitle("0");
      // }

      // complaintCountRequest = [
      //   { key: "tenantId", value: getTenantId() },
      //   {
      //     key: "status",
      //     value: "assigned,escalatedlevel1pending,escalatedlevel2pending"
      //   }
      // ];
      // let assignedTotalComplaints = await httpRequest(
      //   "rainmaker-pgr/v1/requests/_count",
      //   "_search",
      //   complaintCountRequest
      // );
      // complaintCountRequest = [
      //   { key: "tenantId", value: getTenantId() },
      //   {
      //     key: "status",
      //     value: "open,reassignrequested"
      //   }
      // ];
      // let unassignedTotalComplaints = await httpRequest(
      //   "rainmaker-pgr/v1/requests/_count",
      //   "_search",
      //   complaintCountRequest
      // );
      // prepareFinalObject("pgrComplaintCount", {
      //   assignedTotalComplaints: assignedTotalComplaints.count,
      //   unassignedTotalComplaints: unassignedTotalComplaints.count,
      //   employeeTotalComplaints: payloadCount.count
      // });

      if (role === "ao") {
        fetchApplications(
          [
            {
              key: "status",
              value: "assigned,escalatedlevel1pending,escalatedlevel2pending"
            }
          ],
          true,
          false
        );
        fetchApplications(
          [
            {
              key: "status",
              value: "open,reassignrequested"
            }
          ],
          true,
          false
        );
      } else if (role === "eo") {
        fetchApplications(
          [
            {
              key: "status",
              value: "escalatedlevel1pending,escalatedlevel2pending"
            }
          ],
          true,
          true
        );
      }
      else {
        fetchApplications(
          [
            { key: "uuId", value: userInfo.uuid },
            // { Key: "xyq", value: userInfo.uuid },

            // {
            //   key: "status",
            //   value:
            //     rawRole === "EMPLOYEE"
            //       ? "assigned,reassignrequested"
            //       : "assigned,open,reassignrequested"
            // }
          ],
          true,
          true
        );
      }
    }
    let inputType = document.getElementsByTagName("input");
    for (let input in inputType) {
      if (inputType[input].type === "number") {
        inputType[input].addEventListener("mousewheel", function () {
          this.blur();
        });
      }
    }
  };

  componentWillReceiveProps = nextProps => {

    const { role, renderCustomTitle } = this.props;
    console.log('this.props role--', role)
    if (
      !isEqual(
        this.props.transformedComplaints,
        nextProps.transformedComplaints
      )
    ) {
      const numberOfComplaints =
        role === "employee"
          ? 0
          : role === "csr"
            ? nextProps.numCSRComplaint
            : 0;
      renderCustomTitle(numberOfComplaints);
    }
  };

  closeSortDialog = () => {
    this.setState({
      sortPopOpen: false
    });
  };

  onSortClick = () => {
    this.setState({
      sortPopOpen: true
    });
  };

  onComplaintClick = complaintNo => {
    console.log('complaintNo in onComplaintClick',complaintNo);
    this.props.history.push(`/application-details/${'123456'}`);
  };

  onComplaintChange = e => {
    const complaintNo = e.target.value;
    this.setState({ complaintNo });
    if (complaintNo.length < 6) {
      this.setState({
        errorText: "ERR_APPLICATION_NUMBER_SEARCH"
      });
    } else {
      this.setState({ errorText: "" });
    }
  };

  onMobileChange = e => {
    const inputValue = e.target.value;
    this.setState({ mobileNo: inputValue });
  };

  onSearch = () => {
    console.log('on this.props', this.props, this.state)
    const { complaintNo, mobileNo } = this.state;
    const { fetchApplications, searchForm, userInfo, toggleSnackbarAndSetText } = this.props;
    let queryObj = [];
    queryObj.push({ key: 'uuId', value: userInfo.uuid })

    if (complaintNo) {
      queryObj.push({ key: "applicationNumber", value: complaintNo });
    }


    if (mobileNo) {
      queryObj.push({ key: "phone", value: mobileNo });
    }

    if (searchForm && searchForm.fromDate) {
    // this.setState({ fromDate: searchForm.fromDate });

      queryObj.push({ key: "fromDate", value: searchForm.fromDate });
    }

    if (searchForm && searchForm.toDate) {
     // this.setState({ toDate: searchForm.toDate });

      queryObj.push({ key: "toDate", value: searchForm.toDate });
    }

    // if (complaintNo || mobileNo) {
    //   fetchApplications(queryObj, true, true);
    // }

    if (complaintNo) {
      if (complaintNo.length >= 6) {
        fetchApplications(queryObj, true, true);
      } else {
        toggleSnackbarAndSetText(
          true,
          {
            labelName: "Entered value is less than 6 characters in length.",
            labelKey: `ERR_VALUE_LESS_THAN_SIX_CHARACTERS`
          },
          "error"
        );
      }
    } else if (mobileNo) {
      console.log('else if', queryObj);
      fetchApplications(queryObj, true, true);
    } else if (searchForm && searchForm.fromDate) {
      fetchApplications(queryObj, true, true);
    } else if (searchForm && searchForm.toDate) {
      fetchApplications(queryObj, true, true);
    }
    this.setState({ search: true });
  };
  handleFormFields = () => {
    console.log('this.props handleFormFields1', this.props)
    let { metaData, searchForm, labels } = this.props;
    console.log('searchForm-=', searchForm)


    console.log('this.state.fromDate--', this.state.fromDate, this.state.toDate)

    if (!_.isEmpty(metaData) && metaData.reportDetails && metaData.reportDetails.searchParams && metaData.reportDetails.searchParams.length > 0) {
      return metaData.reportDetails.searchParams.map((item, index) => {
        item["value"] = !_.isEmpty(searchForm) ? (searchForm[item.name] ? searchForm[item.name] : "") : "";
        if (item.type === "epoch" && item.minValue && item.maxValue && typeof item.minValue !== "object" && typeof item.maxValue !== "object") {
          item.minValue = this.toDateObj(item.minValue);
          item.maxValue = this.toDateObj(item.maxValue);
        } else if (item.type === "epoch" && item.name == "fromDate" && item.maxValue === null) {
          item.maxValue = new Date();
        }
        if (item.type === "singlevaluelist") {
          item["searchText"] = !_.isEmpty(searchForm) ? (searchForm[item.name] ? searchForm[item.name] : "") : "";
        }
        console.log('showFields--')
        console.log('{item["value"]}--', item["value"])

        // console.log('this.state.fromDate--',this.state.fromDate,this.state.toDate)


        return (
          item.name !== "tenantId" && (
            <ShowField
              value={item["value"]}
              key={index}
              obj={item}
              dateField={this.state.datefield}
              dateError={this.state.dateError}
              handler={this.handleChange}
            //localizationLabels = {labels}
            />
          )
        );
      });
    }
  };


  handleDateSelect = (metaData, e, property) => {
    let { setSearchParams } = this.props;
    if (get(metaData, "reportDetails.searchParams")) {
      let searchParams = metaData.reportDetails.searchParams;
      var i;
      let fromDateIndex, toDateIndex;
      for (i = 0; i < searchParams.length; i++) {
        if (searchParams[i].name === "fromDate") {
          fromDateIndex = i;
        } else if (searchParams[i].name === "toDate") {
          toDateIndex = i;
        }
      }
      if (property === "fromDate" && toDateIndex !== undefined) {
        searchParams[toDateIndex].minValue = new Date(e.target.value);
      } else if (property === "toDate" && fromDateIndex !== undefined) {
        searchParams[fromDateIndex].maxValue = new Date(e.target.value);
      }
      console.log('searchParams===', searchParams)
      setSearchParams(searchParams);
    }
  };
  handleChange = (e, property, isRequired, pattern) => {
    console.log('this.props in handleChange1', this.props)
    const { metaData, setMetaData, handleChange, searchForm } = this.props;
    const selectedValue = e.target.value;
    //const selectedValue = e.target.value;
    console.log('selectedValue---', selectedValue, property)
    if (property === "fromDate" || property === "toDate") {
      this.handleDateSelect(metaData, e, property);
      this.checkDate(selectedValue, property, isRequired, pattern);
    } else {
      handleChange(e, property, isRequired, pattern);
    }

    if (metaData.hasOwnProperty("reportDetails") && metaData.reportDetails.searchParams.length > 0) {
      if (!selectedValue) {
        for (var l = 0; l < metaData.reportDetails.searchParams.length; l++) {
          if (metaData.reportDetails.searchParams[l].type == "url" && metaData.reportDetails.searchParams[l].pattern.search(property) > -1) {
            metaData.reportDetails.searchParams[l].defaultValue = {};
          }
        }
        console.log('metaData1====>>', metaData)
        setMetaData(metaData);
      } else {
        for (var i = 0; i < metaData.reportDetails.searchParams.length; i++) {
          const field = metaData.reportDetails.searchParams[i];
          const defaultValue = field.defaultValue;
          const fieldType = field.type;
          const dependantProperty = field.name;

          if (dependantProperty === property) {
            continue;
          }

          if (typeof defaultValue != "object" || field.hasOwnProperty("pattern")) {
            if (!field.hasOwnProperty("pattern")) {
              field["pattern"] = defaultValue;
            }

            const fieldPattern = field.pattern;

            if (fieldPattern.indexOf("{" + property + "}") == -1) continue;

            if (fieldPattern && fieldPattern.search("{" + property + "}") > -1) {
              this.checkForDependentSource(i, field, selectedValue);
            }
          }
        }
      }
    }
  };

  checkDate = (value, name, required, pattern) => {
    let e = {
      target: {
        value: value,
      },
    };

    if (name == "fromDate") {
      let startDate = value;
      if (this.props.searchForm) {
        try {
          let endDate = this.props.searchForm.toDate;
          this.props.handleChange(e, name, required, pattern);
          this.validateDate(startDate, endDate, required, "fromDate"); //3rd param to denote whether field fails
        } catch (e) {
          console.log(e);
        }
      } else {
        this.props.handleChange(e, name, required, pattern);
      }
    } else {
      let endDate = value;
      if (this.props.searchForm) {
        try {
          let startDate = this.props.searchForm.fromDate;
          this.props.handleChange(e, name, required, pattern);
          this.validateDate(startDate, endDate, required, "toDate"); //3rd param to denote whether field fails
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  validateDate = (startDate, endDate, required, field) => {
    if (startDate && endDate) {
      let sD = new Date(startDate);
      sD.setHours(0, 0, 0, 0);
      let eD = new Date(endDate);
      eD.setHours(0, 0, 0, 0);
      if (eD >= sD) {
        this.setState({ datefield: "" });
        this.setState({ dateError: "" });
      } else {
        let e = {
          target: {
            value: "",
          },
        };
        this.props.handleChange(e, field, required, "");
        this.setState({ datefield: field });
        this.setState({
          dateError:
            field === "toDate" ? (
              <Label labelStyle={{ color: "rgb(244, 67, 54)" }} label="REPORT_SEARCHFORM_DATE_GREATER" />
            ) : (
                <Label labelStyle={{ color: "rgb(244, 67, 54)" }} label="REPORT_SEARCHFORM_DATE_LESSER" />
              ),
        });
      }
    }
  };

  clearSearch = () => {

   
      const { metaData, resetForm, searchForm, setSearchParams } = this.props;
      if (!searchForm) {
        return;
      } else {
        if (get(metaData, "reportDetails.searchParams")) {
          let searchParams = metaData.reportDetails.searchParams;
          var i;
          let fromDateIndex, toDateIndex;
          for (i = 0; i < searchParams.length; i++) {
            if (searchParams[i].name === "fromDate") {
              fromDateIndex = i;
            } else if (searchParams[i].name === "toDate") {
              toDateIndex = i;
            }
          }
          if (fromDateIndex !== undefined) searchParams[fromDateIndex].maxValue = new Date();
          if (toDateIndex !== undefined) {
            searchParams[toDateIndex].minValue = undefined;
            searchParams[toDateIndex].maxValue = undefined;
          }
          setSearchParams(searchParams);
        }
        this.setState({ getResults: false, dateError: "" }, () => {
          resetForm();

        });
      }
    const { fetchApplications } = this.props;
    fetchApplications([
      { key: "status", value: "assigned,open,reassignrequested" }
    ]);
    this.setState({ mobileNo: "", complaintNo: "", search: false });
  };

 

  onChange = value => {
    this.setState({ value });
  };

  render() {

    console.log('this.props in render', this.props)
    const { loading, history } = this.props;
    const {
      mobileNo,
      complaintNo,
      search,
      sortPopOpen,
      errorText
    } = this.state;
    const tabStyle = {
      letterSpacing: "0.6px"
    };
    console.log('this.props role--1', role)

    const { onComplaintClick, onSortClick, closeSortDialog, style } = this;
    const {
      assignedComplaints,
      unassignedComplaints,
      csrComplaints,
      employeeComplaints,
      role,
      searchFilterEmployeeComplaints,
      assignedTotalComplaints,
      unassignedTotalComplaints,
      employeeTotalComplaints
    } = this.props;
    const hintTextStyle = {
      letterSpacing: "0.7px",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      width: "90%",
      overflow: "hidden"
    };
    return role === "ao" ? (
      <div>
        <div
          className="sort-button rainmaker-displayInline"
          style={{ padding: "20px 20px 0px 0px", justifyContent: "flex-end" }}
        >
          <div
            className="rainmaker-displayInline"
            style={{ cursor: "pointer", marginRight: "20px" }}
            onClick={onSortClick}
          >
            <Label
              label="ES_SORT_BUTTON"
              color="rgba(0, 0, 0, 0.8700000047683716)"
              containerStyle={{ marginRight: 5 }}
              labelStyle={{ fontWeight: 500 }}
            />
            <Icon
              style={style.iconStyle}
              action="action"
              name="swap-vert"
              color="rgba(0, 0, 0, 0.8700000047683716)"
            />
          </div>
          <div
            className="rainmaker-displayInline"
            style={{ cursor: "pointer" }}
            onClick={() => history.push("search-complaint")}
          >
            <Label
              label="ES_SEARCH_BUTTON"
              color="rgba(0, 0, 0, 0.8700000047683716)"
              containerStyle={{ marginRight: 5 }}
              labelStyle={{ fontWeight: 500 }}
            />
            <Icon
              style={style.iconStyle}
              action="action"
              name="search"
              color="rgba(0, 0, 0, 0.8700000047683716)"
            />
          </div>
          <SortDialog
            sortPopOpen={sortPopOpen}
            closeSortDialog={closeSortDialog}
          />
        </div>
        <Tabs
          className="employee-complaints-tab"
          onChange={this.onChange}
          tabs={[
            {
              label: (
                <div className="inline-Localization-text">
                  <Label
                    //labelClassName = "unassigned-label-text"
                    labelClassName={
                      this.state.value === 0
                        ? "selected-tab-label-text"
                        : "unselected-tab-label-text"
                    }
                    //color={this.state.value === 0 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)"}
                    bold={true}
                    label={`ES_ALL_COMPLAINTS_UNASSIGNED_TAB_LABEL2`}
                    labelStyle={tabStyle}
                  />
                  {/*<Label
                    labelClassName={
                      this.state.value === 0
                        ? "selected-tab-label-text"
                        : "unselected-tab-label-text"
                    }
                    //color={this.state.value === 0 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)"}
                    bold={true}
                    label={`(${unassignedComplaints.length})`}
                    labelStyle={tabStyle}
                  />*/}
                </div>
              ),
              children: (
                <Screen className="gro-screen" loading={loading}>
                  <div className="tab1-content form-without-button-cont-generic">
                    <CountDetails
                      count={unassignedComplaints.length}
                      total={unassignedTotalComplaints}
                      status="unassigned"
                    />
                    <Complaints
                      noComplaintMessage={
                        "ES_MYCOMPLAINTS_NO_COMPLAINTS_TO_ASSIGN1"
                      }
                      onComplaintClick={onComplaintClick}
                      complaints={unassignedComplaints}
                      complaintLocation={true}
                      role={role}
                      heightOffset="116px"
                    />
                  </div>
                </Screen>
              )
            },
            {
              label: (
                <div className="inline-Localization-text">
                  <Label
                    // labelClassName="assigned-label-text"
                    labelClassName={
                      this.state.value === 1
                        ? "selected-tab-label-text"
                        : "unselected-tab-label-text"
                    }
                    //color={this.state.value === 1 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)"}
                    bold={true}
                    label={`ES_ALL_COMPLAINTS_ASSIGNED_TAB_LABEL`}
                    labelStyle={tabStyle}
                  />
                  {/*<Label
                    labelClassName={
                      this.state.value === 1
                        ? "selected-tab-label-text"
                        : "unselected-tab-label-text"
                    }
                    //color={this.state.value === 1 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)"}
                    bold={true}
                    label={`(${assignedComplaints.length})`}
                    labelStyle={tabStyle}
                  />*/}
                </div>
              ),
              children: (
                <Screen className="gro-screen" loading={loading}>
                  <div className="tab2-content form-without-button-cont-generic">
                    <CountDetails
                      count={assignedComplaints.length}
                      total={assignedTotalComplaints}
                      status="assigned"
                    />
                    <Complaints
                      noComplaintMessage={
                        "ES_MYCOMPLAINTS_NO_ASSIGNED_COMPLAINTS"
                      }
                      onComplaintClick={onComplaintClick}
                      complaints={assignedComplaints}
                      complaintLocation={true}
                      role={role}
                      heightOffset="116px"
                    />
                  </div>
                </Screen>
              )
            }
          ]}
        />
      </div>
    ) : role === "employee" ? (
      <Screen loading={loading}>
        <div className="form-without-button-cont-generic">
          {/* <Grid container spacing={8}>{this.handleFormFields()}</Grid> */}

          <Card
            id="complaint-search-card"
            className="complaint-search-main-card"
            textChildren={
              <div className="complaint-search-cont clearfix">
                <div className="col-xs-12" style={{ paddingLeft: 8 }}>
                  <Label
                    label="MYBK_SEARCH_APPLICATIONS"
                    fontSize={16}
                    dark={true}
                    bold={true}
                  />
                </div>
                <div
                  className="col-sm-3 col-xs-12"
                  style={{ paddingLeft: 8, paddingRight: 40 }}
                >



                  <TextField
                    id="mobile-no"
                    name="mobile-no"
                    type="number"
                    value={mobileNo}
                    hintText={
                      <Label
                        label="MYBK_MOBILE_NUMBER_PLACEHOLDER"
                        color="rgba(0, 0, 0, 0.3799999952316284)"
                        fontSize={16}
                        labelStyle={hintTextStyle}
                      />
                    }
                    floatingLabelText={
                      <Label
                        key={0}
                        label="MYBK_CREATE_APPLICATION_MOBILE_NUMBER"
                        color="rgba(0,0,0,0.60)"
                        fontSize="12px"
                      />
                    }
                    onChange={(e, value) => this.onMobileChange(e)}
                    underlineStyle={{ bottom: 7 }}
                    underlineFocusStyle={{ bottom: 7 }}
                    hintStyle={{ width: "100%" }}
                  />
                </div>
                <div className="col-sm-4 col-xs-12" style={{ paddingLeft: 8 }}>
                  <TextField
                    id="complaint-no"
                    name="complaint-no"
                    value={complaintNo}
                    hintText={
                      <Label
                        label="MYBK_APPLICATION_NO"
                        color="rgba(0, 0, 0, 0.3799999952316284)"
                        fontSize={16}
                        labelStyle={hintTextStyle}
                      />
                    }
                    errorText={<Label label={errorText} color="red" />}
                    floatingLabelText={
                      <Label
                        key={1}
                        label="MYBK_APPLICATION_NO_PLACEHOLDER"
                        color="rgba(0,0,0,0.60)"
                        fontSize="12px"
                      />
                    }
                    onChange={(e, value) => this.onComplaintChange(e)}
                    underlineStyle={{
                      bottom: 7,
                      borderBottom: "1px solid #e0e0e0"
                    }}
                    underlineFocusStyle={{
                      bottom: 7,
                      borderBottom: "1px solid #e0e0e0"
                    }}
                    hintStyle={{ width: "100%" }}
                  />
                  </div>
                  <div className="col-sm-4 col-xs-12" style={{ paddingLeft: 8 }}>
                <TextField
                    id="application-status"
                    name="application-status"
                    value={complaintNo}
                    hintText={
                      <Label
                        label="MYBK_APPLICATION_STATUS"
                        color="rgba(0, 0, 0, 0.3799999952316284)"
                        fontSize={16}
                        labelStyle={hintTextStyle}
                      />
                    }
                    errorText={<Label label={errorText} color="red" />}
                    floatingLabelText={
                      <Label
                        key={1}
                        label="MYBK_APPLICATION_STATUS_PLACEHOLDER"
                        color="rgba(0,0,0,0.60)"
                        fontSize="12px"
                      />
                    }
                     onChange={(e, value) => this.onComplaintChange(e)}
                    underlineStyle={{
                      bottom: 7,
                      borderBottom: "1px solid #e0e0e0"
                    }}
                    underlineFocusStyle={{
                      bottom: 7,
                      borderBottom: "1px solid #e0e0e0"
                    }}
                    hintStyle={{ width: "100%" }}
                  />
                  </div>
              
               <div
                  className="col-sm-6 col-xs-12 csr-action-buttons"
                  style={{ marginTop: 10, paddingRight: 8 }}
                >
                <Grid container spacing={8}>{this.handleFormFields()}</Grid>  
                </div> 
                <div
                  className="col-sm-6 col-xs-12 csr-action-buttons"
                  style={{ marginTop: 10, paddingRight: 8 }}
                >
                  <Button
                    label={
                      <Label
                        buttonLabel={true}
                        label="MYBK_APPLICATIONS_SEARCH_BUTTON"
                      />
                    }
                    style={{ marginRight: 28, width: "36%" }}
                    backgroundColor="#fe7a51"
                    labelStyle={{
                      letterSpacing: 0.7,
                      padding: 0,
                      color: "#fff"
                    }}
                    buttonStyle={{ border: 0 }}
                    onClick={() => this.onSearch()}
                  />
                  <Button
                    label={
                      <Label
                        buttonLabel={true}
                        color="#fe7a51"
                        label="MYBK_APPLICATION_CLEAR_SEARCH_BUTTON"
                      />
                    }
                    labelStyle={{
                      letterSpacing: 0.7,
                      padding: 0,
                      color: "#fe7a51"
                    }}
                    buttonStyle={{ border: "1px solid #fe7a51" }}
                    style={{ width: "36%" }}
                    onClick={() => this.clearSearch()}
                  />
                </div>
              </div>
            }
          />
        </div>
        <div className="form-without-button-cont-generic">
          <Complaints
            noComplaintMessage={
              search
                ? "ES_NO_SEARCH_RESULTS"
                : "ES_MYCOMPLAINTS_NO_COMPLAINTS_ASSIGNED"
            }
            onComplaintClick={onComplaintClick}
            complaints={RequestData}
            role={role}
            complaintLocation={true}
          />
        </div>
        {/* <div className="floating-button-cont csr-add-button">
          <FloatingActionButton
            id="mycomplaints-add"
            onClick={e => {
              history.push("/create-complaint");
            }}
            className="floating-button"
            backgroundColor="#fe7a51"
          >
            <Icon action="content" name="add" />
          </FloatingActionButton>
        </div> */}
      </Screen>
    ) : (
          <Screen loading={loading}>
            <div className="form-without-button-cont-generic">
              <Card
                id="complaint-search-card"
                className="complaint-search-main-card"
                textChildren={
                  <div className="complaint-search-cont clearfix">
                    <div className="col-xs-12" style={{ paddingLeft: 8 }}>
                      <Label
                        label="CORE_COMMON_SEARCH_COMPLAINT123"
                        fontSize={16}
                        dark={true}
                        bold={true}
                      />
                    </div>
                    <div
                      className="col-sm-3 col-xs-12"
                      style={{ paddingLeft: 8, paddingRight: 40 }}
                    >
                      <TextField
                        id="mobile-no"
                        name="mobile-no"
                        type="number"
                        value={mobileNo}
                        hintText={
                          <Label
                            label="CORE_COMMON_MOBILE_NUMBER_PLACEHOLDER345"
                            color="rgba(0, 0, 0, 0.3799999952316284)"
                            fontSize={16}
                            labelStyle={hintTextStyle}
                          />
                        }
                        floatingLabelText={
                          <Label
                            key={0}
                            label="ES_CREATECOMPLAINT_MOBILE_NUMBER678"
                            color="rgba(0,0,0,0.60)"
                            fontSize="12px"
                          />
                        }
                        onChange={(e, value) => this.onMobileChange(e)}
                        underlineStyle={{ bottom: 7 }}
                        underlineFocusStyle={{ bottom: 7 }}
                        hintStyle={{ width: "100%" }}
                      />
                    </div>
                    <div className="col-sm-4 col-xs-12" style={{ paddingLeft: 8 }}>
                      <TextField
                        id="complaint-no"
                        name="complaint-no"
                        value={complaintNo}
                        hintText={
                          <Label
                            label="ES_MYCOMPLAINTS_COMPLAINT_NO01"
                            color="rgba(0, 0, 0, 0.3799999952316284)"
                            fontSize={16}
                            labelStyle={hintTextStyle}
                          />
                        }
                        errorText={<Label label={errorText} color="red" />}
                        floatingLabelText={
                          <Label
                            key={1}
                            label="CS_COMPLAINT_SUBMITTED_COMPLAINT_NO02"
                            color="rgba(0,0,0,0.60)"
                            fontSize="12px"
                          />
                        }
                        onChange={(e, value) => this.onComplaintChange(e)}
                        underlineStyle={{
                          bottom: 7,
                          borderBottom: "1px solid #e0e0e0"
                        }}
                        underlineFocusStyle={{
                          bottom: 7,
                          borderBottom: "1px solid #e0e0e0"
                        }}
                        hintStyle={{ width: "100%" }}
                      />
                    </div>
                    <div
                      className="col-sm-6 col-xs-12 csr-action-buttons"
                      style={{ marginTop: 10, paddingRight: 8 }}
                    >
                      <Button
                        label={
                          <Label
                            buttonLabel={true}
                            label="ES_MYCOMPLAINTS_SEARCH_BUTTON"
                          />
                        }
                        style={{ marginRight: 28, width: "36%" }}
                        backgroundColor="#fe7a51"
                        labelStyle={{
                          letterSpacing: 0.7,
                          padding: 0,
                          color: "#fff"
                        }}
                        buttonStyle={{ border: 0 }}
                        onClick={() => this.onSearch()}
                      />
                      <Button
                        label={
                          <Label
                            buttonLabel={true}
                            color="#fe7a51"
                            label="ES_MYCOMPLAINTS_CLEAR_SEARCH_BUTTON"
                          />
                        }
                        labelStyle={{
                          letterSpacing: 0.7,
                          padding: 0,
                          color: "#fe7a51"
                        }}
                        buttonStyle={{ border: "1px solid #fe7a51" }}
                        style={{ width: "36%" }}
                        onClick={() => this.clearSearch()}
                      />
                    </div>
                  </div>
                }
              />
            </div>
            <div className="form-without-button-cont-generic">
              <CountDetails
                count={
                  search
                    ? searchFilterEmployeeComplaints.length
                    : employeeComplaints.length
                }
                total={employeeTotalComplaints}
                status="open"
              />
              <Complaints
                noComplaintMessage={"ES_MYCOMPLAINTS_NO_COMPLAINTS_ASSIGNED"}
                onComplaintClick={onComplaintClick}
                complaints={
                  search ? searchFilterEmployeeComplaints : employeeComplaints
                }
                role={role}
                complaintLocation={true}
              />
            </div>
          </Screen>
        );
  }
}

const roleFromUserInfo = (roles = [], role) => {
  const roleCodes = roles.map(role => {
    return role.code;
  });
  return roleCodes && roleCodes.length && roleCodes.indexOf(role) > -1
    ? true
    : false;
};

const displayStatus = (status = "") => {
  let statusObj = {};
  if (status.toLowerCase().includes("overdue")) {
    statusObj.status = status; //Replace by localisation label
    statusObj.statusMessage = "";
  }
  if (status.toLowerCase().includes("left")) {
    statusObj.status = status; //Replace by localisation label
    statusObj.statusMessage = "";
  }
  return statusObj;
};
const mapStateToProps = state => {
  console.log('mapStateToProps', state)
  const { complaints, common, screenConfiguration = {} } = state || {};
  const { categoriesById, byId, order } = complaints;
  const { fetchSuccess } = complaints;
  const { preparedFinalObject = {} } = screenConfiguration;
  const { pgrComplaintCount = {} } = preparedFinalObject;
  const {
    assignedTotalComplaints = 0,
    unassignedTotalComplaints = 0,
    employeeTotalComplaints = 0
  } = pgrComplaintCount;
  const loading = !isEmpty(categoriesById)
    ? fetchSuccess
      ? false
      : true
    : true;
  const { citizenById, employeeById } = common || {};
  const { userInfo } = state.auth;
  const role =
    roleFromUserInfo(userInfo.roles, "GRO") ||
      roleFromUserInfo(userInfo.roles, "DGRO")
      ? "ao"
      : roleFromUserInfo(userInfo.roles, "ESCALATION_OFFICER1") ||
        roleFromUserInfo(userInfo.roles, "ESCALATION_OFFICER2")
        ? "eo"
        : roleFromUserInfo(userInfo.roles, "CSR")
          ? "csr"
          : "employee";
  let transformedComplaints = transformComplaintForComponent(
    complaints,
    role,
    employeeById,
    citizenById,
    categoriesById,
    displayStatus
  );
  let assignedComplaints = [],
    unassignedComplaints = [],
    employeeComplaints = [],
    csrComplaints = [];

  let filteredEmployeeComplaints;
  if (role === "eo") {
    filteredEmployeeComplaints = transformedComplaints.filter(
      complaint =>
        complaint.rawStatus === "escalatedlevel1pending" ||
        complaint.rawStatus === "escalatedlevel2pending" ||
        complaint.rawStatus === "assigned"
    );
  } else {
    filteredEmployeeComplaints = transformedComplaints.filter(
      complaint =>

        complaint.complaintStatus === "ASSIGNED" ||
        complaint.rawStatus === "reassignrequested"
    );
  }


  let searchFilterEmployeeComplaints;
  if (role === "eo") {
    searchFilterEmployeeComplaints = transformedComplaints.filter(
      complaint =>
        complaint.rawStatus === "escalatedlevel1pending" ||
        complaint.rawStatus === "escalatedlevel2pending" ||
        complaint.rawStatus === "assigned"
    );
  }
  else {
    searchFilterEmployeeComplaints = transformedComplaints.filter(
      complaint =>
        complaint.complaintStatus === "ASSIGNED" ||
        complaint.rawStatus === "reassignrequested" ||

        complaint.complaintStatus === "CLOSED"
    );
  }


  let filteredAssignedComplaints = transformedComplaints.filter(
    complaint => complaint.complaintStatus === "ASSIGNED" || complaint.complaintStatus === "ESCALATED"
  );
  let filteredUnassignedComplaints = transformedComplaints.filter(
    complaint => complaint.complaintStatus === "UNASSIGNED"
  );

  if (role === "ao") {
    if (order === "Old to New") {
      assignedComplaints = orderby(
        filteredAssignedComplaints,
        ["latestCreationTime"],
        ["asc"]
      );
      unassignedComplaints = orderby(
        filteredUnassignedComplaints,
        ["latestCreationTime"],
        ["asc"]
      );
    } else if (order === "SLA") {
      assignedComplaints = orderby(
        filteredAssignedComplaints,
        ["SLA"],
        ["asc"]
      );
      unassignedComplaints = orderby(
        filteredUnassignedComplaints,
        ["SLA"],
        ["asc"]
      );
    } else {
      assignedComplaints = orderby(
        filteredAssignedComplaints,
        ["latestCreationTime"],
        ["desc"]
      );
      unassignedComplaints = orderby(
        filteredUnassignedComplaints,
        ["latestCreationTime"],
        ["desc"]
      );
    }
  } else if (role === "csr") {
    if (order === "Old to New") {
      // csrComplaints = orderby(
      //   transformedComplaints,
      //   ["latestCreationTime"],
      //   ["asc"]
      // );
    } else if (order === "SLA") {
      // csrComplaints = orderby(transformedComplaints, ["SLA"], ["asc"]);
    } else {
      // csrComplaints = orderby(
      //   transformedComplaints,
      //   ["latestCreationTime"],
      //   ["desc"]
      // );
    }
  } else {
    if (order === "Old to New") {
      employeeComplaints = orderby(
        filteredEmployeeComplaints,
        ["latestCreationTime"],
        ["asc"]
      );
    } else if (order === "SLA") {
      employeeComplaints = orderby(
        filteredEmployeeComplaints,
        ["SLA"],
        ["asc"]
      );
    } else {
      employeeComplaints = orderby(
        filteredEmployeeComplaints,
        ["latestCreationTime"],
        ["desc"]
      );
    }
  }
  transformedComplaints = orderby(
    transformedComplaints,
    ["latestCreationTime"],
    ["desc"]
  );
  const numEmpComplaint = employeeComplaints.length;
  const numCSRComplaint = transformedComplaints.length;
  //const searchForm;
  // if(state&&state.formtemp&&state.formtemp.form)
  //   const searchForm= state.formtemp.form;

  //   if(state&&state.formtemp&&state.formtemp.form){
  //     searchForm= state.formtemp.form;
  //  }
  // const metaData;
  //if(state&&state.report&&state.report.metaData)
  // const metaData= state.report.form;



  //   const metaValues= {};
  //   metaValues={
  //   "reportDetails":{"reportName": "TradeLicenseRegistryReport"},
  //   "tenantId": "ch.chandigarh",
  //   "requestInfo":{"apiId": "emp","msgId": "20170310130900","resMsgId": "uief87324","status": "200",ts: "Thu Jun 11 12:18:18 GMT 2020",ver: "1.0"}
  // }
  console.log('RequestData metaData', state)
  return {
    searchForm: state && state.formtemp && state.formtemp.form ? state.formtemp.form : '',
    metaData: {
      "reportDetails": {
        "reportName": "TradeLicenseRegistryReport", searchParams: [{ localisationRequired: false, name: "fromDate", label: "reports.tl.fromDate", type: "epoch", defaultValue: null },
        { localisationRequired: false, name: "toDate", label: "reports.tl.toDate", type: "epoch", defaultValue: null },
        { localisationRequired: false, name: "collectorname", label: "reports.uc.collectorname", type: "singlevaluelist", defaultValue: {}, }
        ]
      },
      "tenantId": "ch.chandigarh",
      "requestInfo": { "apiId": "emp", "msgId": "20170310130900", "resMsgId": "uief87324", "status": "200", ts: "Thu Jun 11 12:18:18 GMT 2020", ver: "1.0" }
    }, //state && state.report && state.report.metaData ? state.report.metaData : '',
    assignedComplaints,
    unassignedComplaints,
    csrComplaints,
    numEmpComplaint,
    numCSRComplaint,
    employeeComplaints,
    role,
    loading,
    transformedComplaints,
    searchFilterEmployeeComplaints,
    assignedTotalComplaints,
    unassignedTotalComplaints,
    employeeTotalComplaints
  };
};



const RequestData = [{
  "SLA": 5,
  "address": "",
  "addressDetail": {
    "city": "ch.chandigarh",
    "houseNoAndStreetName": "4400",
    "landmark": "Abc",
    "mohalla": "SECTOR-46",
    "tenantId": "ch.chandigarh",
    "uuid": "35f3296c-3395-4563-81fb-44cbad0f944a",
  },
  "assignedTo": "Sonu kumar",
  "citizenPhoneNumber": "7013456789",
  "Request No": "25/05/2020/011275",
  "complaintStatus": "ASSIGNED",
  "employeePhoneNumber": null,
  "header": "DEP01_WaterSupply_07",
  "images": [],
  "latestActionTime": 1590254431142,
  "latestCreationTime": 1590254431141,
  "rawStatus": "assigned",
  "reassign": false,
  "reassignRequestedBy": "NA",
  "status": { "status": "CS_DAYS_LEFT", "statusMessage": "" },
  "submittedBy": "Randeep singh"
},
{
  "SLA": 5,
  "address": "",
  "addressDetail": {
    "city": "ch.chandigarh",
    "houseNoAndStreetName": "4400",
    "landmark": "Abc",
    "mohalla": "SECTOR-46",
    "tenantId": "ch.chandigarh",
    "uuid": "35f3296c-3395-4563-81fb-44cbad0f944a",
  },
  "assignedTo": "Sonu kumar",
  "citizenPhoneNumber": "9599313957",
  "Request No": "25/05/2020/011275",
  "complaintStatus": "ASSIGNED",
  "employeePhoneNumber": null,
  "header": "DEP01_WaterSupply_07",
  "images": [],
  "latestActionTime": 1590254431142,
  "latestCreationTime": 1590254431141,
  "rawStatus": "assigned",
  "reassign": false,
  "reassignRequestedBy": "NA",
  "status": { "status": "CS_DAYS_LEFT", "statusMessage": "" },
  "submittedBy": "Ravi"
}];
const mapDispatchToProps = dispatch => {
  return {

    resetForm: () => {
      dispatch({ type: "RESET_FORM" });
    },
    setMetaData: (metaData) => {
      dispatch({ type: "SET_META_DATA", metaData });
    },
    handleChange: (e, property, isRequired, pattern) => {
      dispatch({
        type: "HANDLE_CHANGES",
        property,
        value: e.target.value,
        isRequired,
        pattern,
      });
    },
    setSearchParams: (searchParams) => {
      dispatch({ type: "SET_SEARCH_PARAMS", searchParams });
    },
    fetchApplications: (criteria, hasUsers, overWrite) =>
      dispatch(fetchApplications(criteria, hasUsers, overWrite)),
    toggleSnackbarAndSetText: (open, message, error) =>
      dispatch(toggleSnackbarAndSetText(open, message, error)),
    prepareFinalObject: (jsonPath, value) =>
      dispatch(prepareFinalObject(jsonPath, value))
  };
};





export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllRequests);
