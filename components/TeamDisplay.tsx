"use client";

import { useState } from "react";
import { Loader2, User, UsersRound, Building } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  username: string;
  university: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

// Mock data for teams
const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Machine Learning Research",
    description:
      "A team focused on cutting-edge machine learning research and applications",
    members: [
      {
        id: "member-1",
        name: "John Smith",
        username: "johnsmith",
        university: "Stanford University",
        role: "Team Lead",
      },
      {
        id: "member-2",
        name: "Emily Davis",
        username: "emilyd",
        university: "MIT",
        role: "Senior Researcher",
      },
      {
        id: "member-3",
        name: "Michael Wong",
        username: "mwong",
        university: "UC Berkeley",
        role: "Data Scientist",
      },
      {
        id: "member-4",
        name: "Sarah Johnson",
        username: "sjohnson",
        university: "Carnegie Mellon",
        role: "ML Engineer",
      },
    ],
  },
  {
    id: "team-2",
    name: "Web Development",
    description:
      "Frontend and backend development for our next-generation applications",
    members: [
      {
        id: "member-5",
        name: "David Lee",
        username: "dlee",
        university: "University of Washington",
        role: "Team Lead",
      },
      {
        id: "member-6",
        name: "Jessica Park",
        username: "jpark",
        university: "UCLA",
        role: "Frontend Developer",
      },
      {
        id: "member-7",
        name: "Ryan Martinez",
        username: "rmartinez",
        university: "Georgia Tech",
        role: "Backend Developer",
      },
    ],
  },
  {
    id: "team-3",
    name: "Cybersecurity Initiative",
    description:
      "Protecting our digital infrastructure and researching new security protocols",
    members: [
      {
        id: "member-8",
        name: "Alexandra Chen",
        username: "achen",
        university: "Harvard University",
        role: "Security Architect",
      },
      {
        id: "member-9",
        name: "Thomas Wilson",
        username: "twilson",
        university: "University of Michigan",
        role: "Penetration Tester",
      },
      {
        id: "member-10",
        name: "Olivia Brown",
        username: "obrown",
        university: "University of Texas",
        role: "Security Analyst",
      },
      {
        id: "member-11",
        name: "James Taylor",
        username: "jtaylor",
        university: "Cornell University",
        role: "Cryptography Specialist",
      },
    ],
  },
];

export default function TeamDisplay() {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Use mock data instead of API fetch
  const teams = mockTeams;
  const isLoading = false;

  const selectedTeamData = selectedTeam
    ? teams.find((team) => team.id === selectedTeam)
    : null;

  const filteredMembers = selectedTeamData?.members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Team Directory</CardTitle>
        <CardDescription>
          Browse public team information and members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="team-select" className="mb-2">Select Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger id="team-select" className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeamData && (
              <>
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedTeamData.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTeamData.description || "No description provided"}
                  </p>
                  <Badge className="mt-2 bg-blue-50 text-blue-800 border-blue-200">
                    <UsersRound className="mr-1 h-3 w-3" />
                    {selectedTeamData.members.length} Members
                  </Badge>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="search-members" className="mb-2">Search Members</Label>
                  <Input
                    id="search-members"
                    placeholder="Search by name, username, or university"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                  />

                  <ScrollArea className="h-[360px] rounded-md border p-4">
                    <div className="space-y-6">
                      {filteredMembers?.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                          No members found matching your search
                        </p>
                      ) : (
                        filteredMembers?.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-start space-x-4"
                          >
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">
                                {member.name}
                              </h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <User className="mr-1 h-3 w-3" />
                                {member.username}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Building className="mr-1 h-3 w-3" />
                                {member.university}
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
