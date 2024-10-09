const mongoose = require("mongoose");

const loginSessionSchema = new mongoose.Schema({
  _id: false,
  deviceType: {
    type: String,
    enum: ["mobile", "web"],
    required: true,
  },
  loginTime: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    admissionNo: String,
    username: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: { type: String },
    role: {
      type: String,
      enum: [
        "superAdmin",
        "instituteAdmin",
        "branchAdmin",
        "staff",
        "teacher",
        "student",
      ],
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: function () {
        return ["instituteAdmin", "branchAdmin", "staff", "student"].includes(
          this.role
        );
      },
    },
    instituteName: {
      type: String,
      required: function () {
        return ["instituteAdmin", "branchAdmin", "staff", "student"].includes(
          this.role
        );
      },
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: function () {
        return ["branchAdmin", "staff", "student"].includes(this.role);
      },
    },
    branchName: {
      type: String,
      required: function () {
        return ["branchAdmin", "staff", "student"].includes(this.role);
      },
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: function () {
        return ["student"].includes(this.role);
      },
    },
    batchName: {
      type: String,
      required: function () {
        return ["student"].includes(this.role);
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
    },
    profileImage: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role !== "superAdmin";
      },
    },
    firstLogin: {
      type: Date,
      default: null,
    },
    lastLoggedIn: {
      type: Date,
      default: null,
    },
    loginSessions: [loginSessionSchema],
    //extra
    dob: { type: Date },
    bloodGroup: { type: String },
    nationality: { type: String },
    religion: { type: String },
    aadharNo: { type: String },
    panNumber: { type: String },
    passportNo: { type: String },
    passportExpiry: { type: Date },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    countryOfIssue: { type: String },
    emergencyContactNumber: { type: String },
    emergnecyContactPerson: { type: String },
    parentMobile: { type: String },
    spouseName: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    fatherMobile: { type: String },
    bankName: { type: String },
    bankBranch: { type: String },
    bankIfsc: { type: String },
    bankAccountNo: { type: String },
    pfAccountNumber: { type: String },
    epsAccountNumber: { type: String },
    community: { type: String },
    registrationType: { type: String },
    remarks: { type: String },
    satsNo: { type: String },
    dateOfJoining: { type: Date },
    contractStartDate: { type: Date },
    contractType: { type: String },
    experience: { type: String },
    feesPaid: { type: Number },
    completionYear: { type: Date },
    academicYear: { type: String },
    class: { type: String },
    hostelId: { type: String },
    transportationId: { type: String },
    roomType: { type: String },
    from: { type: String },
    to: { type: String },
    designation: { type: String },
    department: { type: String },
    previousInstituteName: { type: String },
    collegeName: { type: String },
    collegeCityName: { type: String },
    rollNo: { type: String },
    emergencyContactPerson: { type: String },
    year: { type: String },
    caste: { type: String },
    areaName: { type: String },
    educationalBackground: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
