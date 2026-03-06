import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ServiceRequest {
    customerName: string;
    status: Status;
    serviceType: ServiceType;
    requestId: bigint;
    adminReply?: string;
    submittedAt: bigint;
    isRead: boolean;
    repliedAt?: bigint;
    problemDescription: string;
    phone: string;
    hasNewReply: boolean;
}
export interface Customer {
    serviceType: ServiceType;
    name: string;
    address: string;
    phone: string;
}
export interface UserProfile {
    name: string;
    phone: string;
}
export interface Review {
    customerName: string;
    requestId: bigint;
    submittedAt: bigint;
    comment: string;
    rating: bigint;
    phone: string;
    reviewId: bigint;
}
export enum ServiceType {
    cctv = "cctv",
    computer = "computer"
}
export enum Status {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(name: string, phone: string, address: string, serviceType: ServiceType): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllServiceRequests(): Promise<Array<ServiceRequest>>;
    getAverageRating(): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(phone: string): Promise<Customer | null>;
    getCustomerServiceRequests(phone: string): Promise<Array<ServiceRequest>>;
    getCustomers(): Promise<Array<Customer>>;
    getNewRequestsCount(): Promise<bigint>;
    getReviewByRequestId(requestId: bigint): Promise<Review | null>;
    getReviews(): Promise<Array<Review>>;
    getServiceRequest(requestId: bigint): Promise<ServiceRequest | null>;
    getUnreadServiceRequestsCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasUnreadServiceRequests(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markRequestAsRead(requestId: bigint, phoneNumber: string): Promise<void>;
    replyToServiceRequest(requestId: bigint, reply: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitReview(requestId: bigint, rating: bigint, comment: string): Promise<bigint>;
    submitServiceRequest(customerName: string, phone: string, serviceType: ServiceType, problemDescription: string): Promise<bigint>;
    updateServiceRequestStatus(requestId: bigint, status: Status): Promise<void>;
}
