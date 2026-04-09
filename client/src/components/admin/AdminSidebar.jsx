import { Inbox, LayoutDashboard, ListCollapseIcon, ListIcon, PlusSquareIcon, UsersIcon } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {

  const { user } = useAuth();

  const displayUser = {
    firstName: user?.name?.split(' ')[0] || "Admin",
    lastName: user?.name?.split(' ')[1] || "User",
    imageUrl: user?.image || assets.profile,
  };

  const adminNavlinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Add Topic", path: "/admin/add-topic", icon: PlusSquareIcon },
    { name: "List Topics", path: "/admin/list-topics", icon: ListIcon },
    { name: "List Sessions", path: "/admin/list-sessions", icon: ListCollapseIcon },
    { name: "List Users", path: "/admin/list-users", icon: UsersIcon },
    { name: "Requests", path: "/admin/content-requests", icon: Inbox },
  ];

  return (
    <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm">

      <img
        className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto"
        src={displayUser.imageUrl}
        alt="sidebar"
      />

      <p className="mt-2 text-base max-md:hidden text-gray-300">
        {displayUser.firstName} {displayUser.lastName}
      </p>

      <div className="w-full">

        {adminNavlinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
             end className={({ isActive }) =>
              `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 min-md\:pl-10 first:mt-6 text-gray-400 ${
                isActive && "bg-primary/15 text-primary group"}`}
          >
            {({ isActive }) => (
              <>
                <link.icon className="w-5 h-5" />
                <p className="max-md:hidden">{link.name}</p>

                <span
                  className={`w-1.5 h-10 rounded-l right-0 absolute ${
                    isActive && "bg-primary"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}

      </div>
    </div>
  );
};

export default AdminSidebar;
