import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Migration "migration";

(with migration = Migration.run)
actor {
  type ServiceType = {
    #cctv;
    #computer;
  };

  type Status = {
    #pending;
    #inProgress;
    #completed;
  };

  type Customer = {
    name : Text;
    phone : Text;
    address : Text;
    serviceType : ServiceType;
  };

  type ServiceRequest = {
    requestId : Nat;
    customerName : Text;
    phone : Text;
    serviceType : ServiceType;
    problemDescription : Text;
    status : Status;
    submittedAt : Int;
    adminReply : ?Text;
    repliedAt : ?Int;
    hasNewReply : Bool;
    isRead : Bool;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
  };

  type Review = {
    reviewId : Nat;
    requestId : Nat;
    customerName : Text;
    phone : Text;
    rating : Nat;
    comment : Text;
    submittedAt : Int;
  };

  module ServiceRequest {
    public func compare(request1 : ServiceRequest, request2 : ServiceRequest) : Order.Order {
      Nat.compare(request1.requestId, request2.requestId);
    };
  };

  module Review {
    public func compare(review1 : Review, review2 : Review) : Order.Order {
      Nat.compare(review1.reviewId, review2.reviewId);
    };
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let customers = Map.empty<Text, Customer>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextRequestId = 0;
  let serviceRequests = Map.empty<Nat, ServiceRequest>();
  var hasNewRequestsCount = false;

  let reviews = Map.empty<Nat, Review>();
  var nextReviewId = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Customer Management
  public shared ({ caller }) func addCustomer(name : Text, phone : Text, address : Text, serviceType : ServiceType) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add customers");
    };

    let customer : Customer = {
      name;
      phone;
      address;
      serviceType;
    };
    customers.add(phone, customer);
  };

  public query ({ caller }) func getCustomer(phone : Text) : async ?Customer {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view customer details");
    };
    customers.get(phone);
  };

  public query ({ caller }) func getCustomers() : async [Customer] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    customers.values().toArray();
  };

  // Service Request Management
  public shared ({ caller }) func submitServiceRequest(customerName : Text, phone : Text, serviceType : ServiceType, problemDescription : Text) : async Nat {
    // Anyone can submit a service request (including guests)
    let requestId = nextRequestId;
    nextRequestId += 1;

    let newRequest : ServiceRequest = {
      requestId;
      customerName;
      phone;
      serviceType;
      problemDescription;
      status = #pending;
      submittedAt = Time.now();
      adminReply = null;
      repliedAt = null;
      hasNewReply = false;
      isRead = false;
    };

    serviceRequests.add(requestId, newRequest);
    hasNewRequestsCount := true;
    requestId;
  };

  public query ({ caller }) func getServiceRequest(requestId : Nat) : async ?ServiceRequest {
    switch (serviceRequests.get(requestId)) {
      case (null) { null };
      case (?request) {
        if (AccessControl.isAdmin(accessControlState, caller)) {
          ?request;
        } else {
          ?request;
        };
      };
    };
  };

  public query ({ caller }) func getAllServiceRequests() : async [ServiceRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all service requests");
    };
    serviceRequests.values().toArray().sort();
  };

  public query ({ caller }) func getCustomerServiceRequests(phone : Text) : async [ServiceRequest] {
    serviceRequests.values().toArray().filter(
      func(request) { request.phone == phone }
    );
  };

  public query ({ caller }) func getUnreadServiceRequestsCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view unread request counts");
    };
    let unreadRequests = serviceRequests.values().toArray().filter(
      func(request) { not request.isRead }
    );
    unreadRequests.size();
  };

  public query ({ caller }) func getNewRequestsCount() : async Nat {
    let unreadRequests = serviceRequests.values().toArray().filter(
      func(request) { request.hasNewReply }
    );
    unreadRequests.size();
  };

  public query ({ caller }) func hasUnreadServiceRequests() : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can check for unread requests");
    };
    hasNewRequestsCount;
  };

  public shared ({ caller }) func replyToServiceRequest(requestId : Nat, reply : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reply to service requests");
    };

    let request = findServiceRequest(requestId);

    let updatedRequest : ServiceRequest = {
      request with
      adminReply = ?reply;
      repliedAt = ?Time.now();
      hasNewReply = true;
    };
    serviceRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func updateServiceRequestStatus(requestId : Nat, status : Status) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update service request status");
    };

    let request = findServiceRequest(requestId);

    let updatedRequest : ServiceRequest = { request with status };
    serviceRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func markRequestAsRead(requestId : Nat, phoneNumber : Text) : async () {
    let request = findServiceRequest(requestId);

    if (request.phone != phoneNumber) {
      Runtime.trap("Unauthorized: Only the request owner can mark as read");
    };

    let updatedRequest : ServiceRequest = {
      request with
      isRead = true;
      hasNewReply = false;
    };
    serviceRequests.add(requestId, updatedRequest);
  };

  // Review Feature
  public shared ({ caller }) func submitReview(requestId : Nat, rating : Nat, comment : Text) : async Nat {
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let serviceRequest = switch (serviceRequests.get(requestId)) {
      case (null) { Runtime.trap("Service request not found") };
      case (?request) { request };
    };

    // Check if a review already exists for this request
    let existingReview = reviews.values().toArray().find(
      func(review) { review.requestId == requestId }
    );

    switch (existingReview) {
      case (?_) { Runtime.trap("A review already exists for this service request") };
      case (null) { /* Continue */ };
    };

    let reviewId = nextReviewId;
    nextReviewId += 1;

    let newReview : Review = {
      reviewId;
      requestId;
      customerName = serviceRequest.customerName;
      phone = serviceRequest.phone;
      rating;
      comment;
      submittedAt = Time.now();
    };

    reviews.add(reviewId, newReview);
    reviewId;
  };

  public query ({ caller }) func getReviews() : async [Review] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all reviews");
    };
    reviews.values().toArray().sort();
  };

  public query ({ caller }) func getAverageRating() : async Float {
    let allReviews = reviews.values().toArray();
    let reviewCount = allReviews.size();

    if (reviewCount == 0) { return 0.0 };

    var sum : Nat = 0;
    for (review in allReviews.values()) {
      sum += review.rating;
    };

    sum.toFloat() / reviewCount.toFloat();
  };

  public query ({ caller }) func getReviewByRequestId(requestId : Nat) : async ?Review {
    reviews.values().toArray().find(
      func(review) { review.requestId == requestId }
    );
  };

  // Helper Functions
  func findServiceRequest(requestId : Nat) : ServiceRequest {
    switch (serviceRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };
  };
};
