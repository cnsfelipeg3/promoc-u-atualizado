import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Tag,
  Video,
  Bot,
  ScrollText,
  Settings,
  ArrowLeft,
} from "lucide-react";
import logoWhite from "@/assets/logo-promoceu-branco.png";

const items = [
  { title: "Dashboard", url: "/painel", icon: LayoutDashboard },
  { title: "Promoções", url: "/painel/promocoes", icon: Tag },
  { title: "Vídeos", url: "/painel/videos", icon: Video },
  { title: "Agentes", url: "/painel/agentes", icon: Bot },
  { title: "Logs", url: "/painel/logs", icon: ScrollText },
  { title: "Configurações", url: "/painel/configuracoes", icon: Settings },
];

const PainelSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/painel") return location.pathname === "/painel";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-[#0a1128]">
      <SidebarContent className="bg-[#0a1128]">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3">
          <img src={logoWhite} alt="PromoCéu" className="h-8 w-auto" />
          {!collapsed && <span className="text-white font-bold text-lg">PromoCéu</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/painel"}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive(item.url)
                          ? "bg-amber-500/20 text-amber-400"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Back to landing */}
        <div className="mt-auto p-4">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {!collapsed && <span>Voltar ao site</span>}
          </NavLink>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default PainelSidebar;
