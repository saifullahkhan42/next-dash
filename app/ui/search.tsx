'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

{/*
  Debouncing is a programming practice that limits the rate at which a function can fire. 
  In our case, you only want to query the database when the user has stopped typing.

  How Debouncing Works:

  Trigger Event: When an event that should be debounced (like a keystroke in the search box) occurs, a timer starts.
  Wait: If a new event occurs before the timer expires, the timer is reset.
  Execution: If the timer reaches the end of its countdown, the debounced function is executed.

*/}

export default function Search({ placeholder }: { placeholder: string }) {

  const searchParams = useSearchParams(); // get the search params
  const pathname = usePathname(); // get the current pathname
  const { replace } = useRouter(); // get the router

  {/**
    This function will wrap the contents of handleSearch, 
    and only run the code after a specific time once the user has stopped typing (300ms).
  */}

  const handleSearch = useDebouncedCallback((term: string) => {
    console.log("Searching...", term);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');  //when the user types a new search query, you want to reset the page number to 1.
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  {/* 
  function handleSearch(term: string) {

    console.log("Searching...", term);
    
    const params = new URLSearchParams(searchParams);
    // URLSearchParams is a Web API that provides utility methods for manipulating
    //  the URL query parameters. Instead of creating a complex string literal, 
    //  you can use it to get the params string like ?page=1&query=a
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);    
  };
  // Here's a breakdown of what's happening:

  // ${pathname} is the current path, in your case, "/dashboard/invoices".
  // As the user types into the search bar, params.toString() translates this input into a URL-friendly format.
  // replace(${pathname}?${params.toString()}) updates the URL with the user's search data. For example, /dashboard/invoices?query=lee if the user searches for "Lee".
  // The URL is updated without reloading the page, thanks to Next.js's client-side navigation (which you learned about in the chapter on navigating between pages.
    */}
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()} //get the query param useing searchParams hook.
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
