import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { getApiLimitCount } from "@/lib/api-limits";
import { checkSubscription } from "@/lib/subscription";

//we haven't imported both of these functions in the sidebar component directly because side bar is a client component and api-limits is a server
//component( because we are interacting with prismadb there) client components can't import directly from server components
// By defining a "use client" in a file, all other modules imported into it,
//  including child components, are considered part of the client bundle.

const DashboardLayout=async({
    children
}:{
    children: React.ReactNode;
})=>{
    const apiLimitCount= await getApiLimitCount();
    const isPro =await checkSubscription();
    
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex 
            md:w-72 md:flex-col
            md:fixed md:inset-y-0 
             bg-gray-900">

            <Sidebar isPro={isPro} apiLimitCount={apiLimitCount}/>
            
            </div>
            <main className="md:pl-72">
                <Navbar/>
                {children}
            </main>
        </div>

    );
}

export default DashboardLayout;