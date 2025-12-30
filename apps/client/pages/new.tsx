import { useState, useEffect } from "react";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useUser } from "../store/session";
import { getCookie } from "cookies-next";
import { toast } from "@/shadcn/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("../components/BlockEditor"), { ssr: false });

const type = [
  { id: 5, name: "Incident" },
  { id: 1, name: "Service" },
  { id: 2, name: "Feature" },
  { id: 3, name: "Bug" },
  { id: 4, name: "Maintenance" },
  { id: 6, name: "Access" },
  { id: 8, name: "Feedback" },
];

export default function CreateTicket() {
  const { t } = useTranslation("peppermint");
  const router = useRouter();
  const token = getCookie("session");
  const { user } = useUser();

  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [engineerId, setEngineerId] = useState("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState<any>("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [options, setOptions] = useState<any>();
  const [users, setUsers] = useState<any>();
  const [selectedType, setSelectedType] = useState<string>(
    type[3]?.name ?? ""
  );

  const fetchClients = async () => {
    await fetch(`/api/v1/clients/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          setOptions(res.clients);
        }
      });
  };

  async function fetchUsers() {
    try {
      await fetch(`/api/v1/users/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res) {
            setUsers(res.users);
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  async function createTicket() {
    await fetch(`/api/v1/ticket/create`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        title,
        company: companyId || undefined,
        email,
        detail: issue,
        priority,
        engineer: engineerId
          ? users?.find((user: any) => user.id === engineerId)
          : undefined,
        type: selectedType,
        createdBy: {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success === true) {
          toast({
            variant: "default",
            title: "Success",
            description: "Ticket created successfully",
          });
          router.push("/tickets");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Error: ${res.error}`,
          });
        }
      });
  }

  useEffect(() => {
    fetchClients();
    fetchUsers();
  }, []);

  return (
    <div className="h-full bg-white dark:bg-[#0A090C]">
      <div className="w-full border-b-[1px] p-2 flex flex-row justify-between items-center">
        <div className="flex flex-row space-x-4">
          <Select
            value={companyId || "unassigned"}
            onValueChange={(value) =>
              setCompanyId(value === "unassigned" ? "" : value)
            }
          >
            <SelectTrigger className="min-w-[172px] bg-background/60">
              <SelectValue placeholder={t("select_a_client")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {options?.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={engineerId || "unassigned"}
            onValueChange={(value) =>
              setEngineerId(value === "unassigned" ? "" : value)
            }
          >
            <SelectTrigger className="min-w-[172px] bg-background/60">
              <SelectValue placeholder={t("select_an_engineer")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users?.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="min-w-[172px] bg-background/60">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {type.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <button
            type="button"
            onClick={() => createTicket()}
            className="rounded bg-green-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Create Ticket
          </button>
        </div>
      </div>
      <div className="flex flex-col xl:flex-row h-full w-full">
        <div className="w-full order-2 xl:order-2">
          <div className="px-4 border-b border-gray-700">
            <input
              type="text"
              name="title"
              placeholder={t("ticket_details")}
              maxLength={64}
              autoComplete="off"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-0 pr-0 sm:text-xl border-none dark:bg-[#0A090C] dark:text-white focus:outline-none focus:shadow-none focus:ring-0 focus:border-none"
            />
          </div>
          <Editor setIssue={setIssue} />
        </div>
        <div className="w-full xl:w-1/6 p-3 flex flex-col dark:bg-[#0A090C] dark:text-white border-b-[1px] xl:border-b-0 xl:border-r-[1px] order-1 xl:order-1">
          <div className="flex flex-col">
            <div>
              <label>
                <span className="block text-sm font-medium text-gray-700 dark:text-white">
                  Contact Name
                </span>
              </label>
              <input
                type="text"
                id="name"
                placeholder={t("ticket_name_here")}
                name="name"
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-0 pr-0 sm:text-sm border-none focus:outline-none dark:bg-[#0A090C] dark:text-white focus:shadow-none focus:ring-0 focus:border-none"
              />
            </div>

            <div>
              <label>
                <span className="block text-sm font-medium text-gray-700 dark:text-white">
                  Contact Email
                </span>
              </label>
              <input
                type="text"
                name="email"
                placeholder={t("ticket_email_here")}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-0 pr-0 sm:text-sm border-none focus:outline-none dark:bg-[#0A090C] dark:text-white focus:shadow-none focus:ring-0 focus:border-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
