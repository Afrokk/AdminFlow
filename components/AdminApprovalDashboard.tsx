"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Building,
  Github,
  ArrowLeft,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

// Mock data for pending registrations
const mockPendingRegistrations = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    university: "University of Example",
    preferredUsername: "johndoe",
    status: "PENDING",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    university: "Example State University",
    preferredUsername: "janesmith",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    university: "Example Tech Institute",
    preferredUsername: "mikejohnson",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    university: "University of Technology",
    preferredUsername: "emilydavis",
    status: "REJECTED",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "5",
    name: "Alex Wilson",
    email: "alex.wilson@example.com",
    university: "Example University",
    preferredUsername: "alexwilson",
    status: "PENDING",
    createdAt: new Date().toISOString(), // Today
  },
];

type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  university: string;
  preferredUsername: string;
  githubId?: string;
  status: RegistrationStatus;
  createdAt: string;
}

export default function AdminApprovalDashboard() {
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [comments, setComments] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();


  const [pendingRegistrations, setPendingRegistrations] = useState(
    mockPendingRegistrations
  );
  const isLoading = false;


  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      comments,
    }: {
      id: string;
      status: RegistrationStatus;
      comments?: string;
    }) => {
      // Simulate API call
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setPendingRegistrations((prev) =>
            prev.map((user) => (user.id === id ? { ...user, status } : user))
          );
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      setSelectedUser(null);
      setComments("");
    },
  });

  const handleApprove = () => {
    if (selectedUser) {
      updateMutation.mutate({
        id: selectedUser.id,
        status: "APPROVED",
        comments,
      });
    }
  };

  const handleReject = () => {
    if (selectedUser) {
      updateMutation.mutate({
        id: selectedUser.id,
        status: "REJECTED",
        comments,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-800 border-green-200"
          >
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-800 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to home
      </Link>
      <CardHeader>
        <CardTitle>User Registration Approval</CardTitle>
        <CardDescription>
          Review and approve new user registration requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="all">All Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingRegistrations?.filter(
                (user) => user.status === "PENDING"
              ).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending registrations
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRegistrations
                    ?.filter((user) => user.status === "PENDING")
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.university}</TableCell>
                        <TableCell>{user.preferredUsername}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDialogOpen(true);
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRegistrations?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderStatusBadge(user.status)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Review the user registration details below
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <>
              <div className="space-y-4 py-2">
                <div className="flex items-start space-x-2">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-muted-foreground">Name</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Building className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedUser.university}</p>
                    <p className="text-sm text-muted-foreground">University</p>
                  </div>
                </div>

                {selectedUser.githubId && (
                  <div className="flex items-start space-x-2">
                    <Github className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedUser.githubId}</p>
                      <p className="text-sm text-muted-foreground">GitHub ID</p>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">
                    Comments (optional)
                  </p>
                  <Textarea
                    placeholder="Add any comments about this registration"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                {selectedUser.status === "PENDING" ? (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleReject}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </>
                ) : (
                  <div className="w-full text-center">
                    {renderStatusBadge(selectedUser.status)}
                    <p className="text-sm text-muted-foreground mt-2">
                      This registration has already been{" "}
                      {selectedUser.status.toLowerCase()}
                    </p>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
