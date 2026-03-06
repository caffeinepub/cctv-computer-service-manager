import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Customer,
  ServiceRequest,
  ServiceType,
  Status,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllServiceRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<ServiceRequest[]>({
    queryKey: ["allServiceRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllServiceRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    retry: false,
  });
}

export function useCustomerServiceRequests(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ServiceRequest[]>({
    queryKey: ["customerServiceRequests", phone],
    queryFn: async () => {
      if (!actor || !phone) return [];
      return actor.getCustomerServiceRequests(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
    refetchInterval: 10000,
  });
}

export function useNewRequestsCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["newRequestsCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getNewRequestsCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    retry: false,
  });
}

export function useUnreadCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getUnreadServiceRequestsCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    retry: false,
  });
}

export function useCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCustomers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useSubmitServiceRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerName,
      phone,
      serviceType,
      problemDescription,
    }: {
      customerName: string;
      phone: string;
      serviceType: ServiceType;
      problemDescription: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitServiceRequest(
        customerName,
        phone,
        serviceType,
        problemDescription,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerServiceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["allServiceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["newRequestsCount"] });
    },
  });
}

export function useReplyToServiceRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      reply,
    }: { requestId: bigint; reply: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.replyToServiceRequest(requestId, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allServiceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["customerServiceRequests"] });
    },
  });
}

export function useUpdateServiceRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: { requestId: bigint; status: Status }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateServiceRequestStatus(requestId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allServiceRequests"] });
    },
  });
}

export function useMarkRequestAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      phoneNumber,
    }: { requestId: bigint; phoneNumber: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.markRequestAsRead(requestId, phoneNumber);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customerServiceRequests", variables.phoneNumber],
      });
    },
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      phone,
      address,
      serviceType,
    }: {
      name: string;
      phone: string;
      address: string;
      serviceType: ServiceType;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCustomer(name, phone, address, serviceType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
