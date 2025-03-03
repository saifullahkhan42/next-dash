import CustomersTable from "@/app/ui/customers/table";
import { lusitana } from "@/app/ui/fonts";
import { fetchFilteredCustomers } from "@/app/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Customers',
  };

export default async function Page() {
    return (
        <main>
            <p>Customer Page</p>            
        </main>
    );
}