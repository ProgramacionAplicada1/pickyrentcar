import Sidebar from "@/components/Sidebar";


export default function Layout({
    children,
}:{
    children: React.ReactNode;
}){

    return(

        <div className="flex h-screen bg-gray-100">

            <Sidebar/>

            <div className="flex-1 flex flex-col">


                <main className="flex-1 overflow-y-auto p-8">

                    {children}

                </main>

            </div>

        </div>

    );

}