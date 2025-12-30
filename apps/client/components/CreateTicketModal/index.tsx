import { Dialog, DialogBackdrop, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getCookie } from "cookies-next";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { useUser } from "../../store/session";

import { toast } from "@/shadcn/hooks/use-toast";
import { useSidebar } from "@/shadcn/ui/sidebar";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("../BlockEditor"), { ssr: false });

const type = [
  { id: 5, name: "Incident" },
  { id: 1, name: "Service" },
  { id: 2, name: "Feature" },
  { id: 3, name: "Bug" },
  { id: 4, name: "Maintenance" },
  { id: 6, name: "Access" },
  { id: 8, name: "Feedback" },
];

export default function CreateTicketModal({ keypress, setKeyPressDown }) {
  const { t, lang } = useTranslation("peppermint");
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const token = getCookie("session");

  const { user } = useUser();
  const { state } = useSidebar();

  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [engineerId, setEngineerId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState<any>();
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
            // TODO: THINK ABOUT AUTO ASSIGN PREFERENCES
            // setEngineer(user)
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
            description: "Ticket created succesfully",
          });
          router.push("/issues");
        } else {
          toast({
            variant: "destructive",
            title: `Error`,
            description: res.message,
          });
        }
      });
  }

  function checkPress() {
    if (keypress) {
      setOpen(true);
      setKeyPressDown(false);
    }
  }

  useEffect(() => {
    fetchClients();
    fetchUsers();
  }, []);

  useEffect(() => checkPress(), [keypress]);

  const [hideKeyboardShortcuts, setHideKeyboardShortcuts] = useState(false);
  const [hideName, setHideName] = useState(false);
  const [hideEmail, setHideEmail] = useState(false);

  useEffect(() => {
    const loadFlags = () => {
      const savedFlags = localStorage.getItem("featureFlags");
      if (savedFlags) {
        const flags = JSON.parse(savedFlags);
        const hideShortcuts = flags.find(
          (f: any) => f.name === "Hide Keyboard Shortcuts"
        )?.enabled;

        const hideName = flags.find(
          (f: any) => f.name === "Hide Name in Create"
        )?.enabled;

        const hideEmail = flags.find(
          (f: any) => f.name === "Hide Email in Create"
        )?.enabled;

        setHideKeyboardShortcuts(hideShortcuts || false);
        setHideName(hideName || false);
        setHideEmail(hideEmail || false);
      }
    };

    loadFlags();
    window.addEventListener("storage", loadFlags);
    return () => window.removeEventListener("storage", loadFlags);
  }, []);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0" onClose={setOpen}>
          <div className="flex items-end justify-center min-h-screen align-middle pt-4 mx-4 md:mx-12 text-center -mt-[50%] sm:-mt-0 sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block bg-background rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 align-middle md:max-w-3xl w-full ">
                <div className="flex flex-row w-full align-middle">
                  <span className="text-md pb-2 font-semibold text-sm">
                    New Issue
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto mb-1.5"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
                <Input
                  type="text"
                  name="title"
                  placeholder="Issue title"
                  maxLength={64}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-border/70 bg-background/60 text-lg font-semibold"
                />

                <div className="">
                  {!hideName && (
                    <Input
                      type="text"
                      id="name"
                      placeholder={t("ticket_name_here")}
                      name="name"
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-border/70 bg-background/60"
                    />
                  )}

                  {!hideEmail && (
                    <Input
                      type="text"
                      name="email"
                      placeholder={t("ticket_email_here")}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-border/70 bg-background/60"
                    />
                  )}

                  <Editor setIssue={setIssue} />

                  <div className="flex flex-row space-x-4 pb-2 mt-2">
                    {!user.external_user && (
                      <>
                        <Select
                          value={companyId || "unassigned"}
                          onValueChange={(value) =>
                            setCompanyId(value === "unassigned" ? "" : value)
                          }
                        >
                          <SelectTrigger className="min-w-[172px] bg-background/60">
                            <SelectValue
                              placeholder={t("select_a_client")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
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
                            <SelectValue
                              placeholder={t("select_an_engineer")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {users?.map((user: any) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={selectedType}
                          onValueChange={setSelectedType}
                        >
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
                      </>
                    )}
                  </div>

                  <div className="border-t border-border/60 ">
                    <div className="mt-2 float-right">
                      <Button
                        onClick={() => {
                          setOpen(false);
                          createTicket();
                        }}
                        type="button"
                      >
                        Create Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
