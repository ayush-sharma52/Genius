import { UserButton } from "@clerk/nextjs";

import MobileSideBar from "./mobile-sidebar";
import { getApiLimitCount } from "@/lib/api-limits";
import { checkSubscription } from "@/lib/subscription";

const Navbar=async()=>{
    const apiLimitCount=getApiLimitCount();
    const isPro = await checkSubscription();
    return (
        <div className="flex items-center p-4 ">
            <MobileSideBar isPro={isPro} apiLimitCount={apiLimitCount}/>
            <div className="flex w-full justify-end">
            <UserButton afterSignOutUrl="/"/>
            </div>
        </div>
    );
}
export default Navbar;