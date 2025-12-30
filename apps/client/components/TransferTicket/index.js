import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogBackdrop, Transition } from "@headlessui/react";
// import { XIcon } from "@heroicons/react/24/outline";
import { DocumentDuplicateIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { Button } from "@/shadcn/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";

export default function TransferTicket({ id }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState();
  const [selectedUserId, setSelectedUserId] = useState("");

  const router = useRouter();

  const fetchUsers = async () => {
    await fetch(`/api/v1/users/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          setUsers(res.users);
        }
      });
  };

  async function postData() {
    if (!selectedUserId) return;
    await fetch(`/api/v1/ticket/${id}/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: selectedUserId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.reload();
        }
      });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div
        className="flex flex-row px-4 py-2 w-full group text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:cursor-pointer"
        onClick={() => {
          setOpen(true);
        }}
      >
        <DocumentDuplicateIcon
          className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-foreground"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-foreground">Transfer</span>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={setOpen}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              <div className="inline-block align-bottom rounded-lg bg-card/90 px-4 pt-5 pb-4 text-left shadow-xl backdrop-blur transition-all sm:my-8 sm:align-middle sm:max-w-xl h-64 sm:w-full sm:p-6">
                <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    {/* <XIcon className="h-6 w-6" aria-hidden="true" /> */}
                  </Button>
                </div>
                <div className="sm:flex sm:items-start w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-foreground"
                    >
                      Transfer Ticket
                    </Dialog.Title>
                    <div className="mt-2 pb-16">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Assigned to
                        </label>
                        <Select
                          value={selectedUserId}
                          onValueChange={setSelectedUserId}
                        >
                          <SelectTrigger className="bg-background/60">
                            <SelectValue placeholder="Please select new user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <button
                        onClick={() => {
                          postData();
                        }}
                        type="button"
                        className="float-right mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        save
                      </button>
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
