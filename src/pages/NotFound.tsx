import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;


// import { IconFolderCode } from "@tabler/icons-react"
// import { ArrowUpRightIcon } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import {
//   Empty,
//   EmptyContent,
//   EmptyDescription,
//   EmptyHeader,
//   EmptyMedia,
//   EmptyTitle,
// } from "@/components/ui/empty"

// export function NotFound() {
//   return (
//     <Empty>
//       <EmptyHeader>
//         <EmptyMedia variant="icon">
//           <IconFolderCode />
//         </EmptyMedia>
//         <EmptyTitle>No Projects Yet</EmptyTitle>
//         <EmptyDescription>
//           You haven&apos;t created any projects yet. Get started by creating
//           your first project.
//         </EmptyDescription>
//       </EmptyHeader>
//       <EmptyContent>
//         <div className="flex gap-2">
//           <Button>Create Project</Button>
//           <Button variant="outline">Import Project</Button>
//         </div>
//       </EmptyContent>
//       <Button
//         variant="link"
//         asChild
//         className="text-muted-foreground"
//         size="sm"
//       >
//         <a href="#">
//           Learn More <ArrowUpRightIcon />
//         </a>
//       </Button>
//     </Empty>
//   )
// }
