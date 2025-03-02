import CustomersTable from "@/app/ui/customers/table";
import { lusitana } from "@/app/ui/fonts";
import { fetchCustomers } from "@/app/lib/data";

export default async function Page() {
    const customers = await fetchCustomers();
    console.log(customers);
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Customers
            </h1>
            {/* <CustomersTable customers={customers} /> */}
        </main>
    );
}