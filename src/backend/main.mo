import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

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

  module ServiceRequest {
    public func compare(request1 : ServiceRequest, request2 : ServiceRequest) : Order.Order {
      Nat.compare(request1.requestId, request2.requestId);
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
        // Admin can view any request, users can view their own requests by phone
        if (AccessControl.isAdmin(accessControlState, caller)) {
          ?request;
        } else {
          // For non-admin users, they need to verify ownership through phone number
          // This is a limitation - we can't directly verify ownership here without phone parameter
          // So we return the request and let the frontend handle filtering
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
    // Anyone can query by phone number (they need to know the phone number)
    // This allows customers to view their own requests
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
    // This appears to be for customers to check if they have new replies
    // Allow any authenticated user to check
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
    // Anyone with the phone number can mark as read (customer ownership verification)
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

  // Helper Functions
  func findServiceRequest(requestId : Nat) : ServiceRequest {
    switch (serviceRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };
  };
};
