import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    customers : Map.Map<Text, { name : Text; phone : Text; address : Text; serviceType : { #cctv; #computer } }>;
    userProfiles : Map.Map<Principal, { name : Text; phone : Text }>;
    nextRequestId : Nat;
    serviceRequests : Map.Map<Nat, {
      requestId : Nat;
      customerName : Text;
      phone : Text;
      serviceType : { #cctv; #computer };
      problemDescription : Text;
      status : { #pending; #inProgress; #completed };
      submittedAt : Int;
      adminReply : ?Text;
      repliedAt : ?Int;
      hasNewReply : Bool;
      isRead : Bool;
    }>;
    hasNewRequestsCount : Bool;
  };

  type NewActor = {
    customers : Map.Map<Text, { name : Text; phone : Text; address : Text; serviceType : { #cctv; #computer } }>;
    userProfiles : Map.Map<Principal, { name : Text; phone : Text }>;
    nextRequestId : Nat;
    serviceRequests : Map.Map<Nat, {
      requestId : Nat;
      customerName : Text;
      phone : Text;
      serviceType : { #cctv; #computer };
      problemDescription : Text;
      status : { #pending; #inProgress; #completed };
      submittedAt : Int;
      adminReply : ?Text;
      repliedAt : ?Int;
      hasNewReply : Bool;
      isRead : Bool;
    }>;
    hasNewRequestsCount : Bool;
    reviews : Map.Map<Nat, {
      reviewId : Nat;
      requestId : Nat;
      customerName : Text;
      phone : Text;
      rating : Nat;
      comment : Text;
      submittedAt : Int;
    }>;
    nextReviewId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newReviews = Map.empty<Nat, {
      reviewId : Nat;
      requestId : Nat;
      customerName : Text;
      phone : Text;
      rating : Nat;
      comment : Text;
      submittedAt : Int;
    }>();
    { old with reviews = newReviews; nextReviewId = 0 };
  };
};
