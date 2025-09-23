// // src/features/dashboard/pages/Dashboard.tsx

// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
// import { ArrowRight } from "lucide-react";
// import { Link } from "react-router-dom";
// import {
//   LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
// } from "recharts";

// const metricData = [
//   { title: "Total Merchants", value: "1,245", change: "+12%" },
//   { title: "Total Transactions", value: "₦45,234,000", change: "+5%" },
//   { title: "Disputes Open", value: "32", change: "-3%" },
//   { title: "Active Users", value: "876", change: "+7%" },
// ];

// const chartData = [
//   { month: "Jan", transactions: 4000 },
//   { month: "Feb", transactions: 3000 },
//   { month: "Mar", transactions: 5000 },
//   { month: "Apr", transactions: 4780 },
//   { month: "May", transactions: 5890 },
//   { month: "Jun", transactions: 4390 },
// ];

// const recentTransactions = [
//   { id: "TXN12345", merchant: "Naira.com", amount: "₦12,000", status: "Success", date: "2025-09-15" },
//   { id: "TXN12346", merchant: "PayLink", amount: "₦8,500", status: "Pending", date: "2025-09-14" },
//   { id: "TXN12347", merchant: "BetaStore", amount: "₦32,000", status: "Failed", date: "2025-09-14" },
//   { id: "TXN12348", merchant: "QuickPay", amount: "₦15,700", status: "Success", date: "2025-09-13" },
//   { id: "TXN12349", merchant: "VerveLife", amount: "₦22,100", status: "Success", date: "2025-09-13" },
// ];

// export default function Dashboard() {
//   return (
//     <div className="p-6 space-y-6">
//       {/* Metrics Section */}
//       <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//         {metricData.map((m, idx) => (
//           <Card key={idx} className="p-4 flex flex-col gap-2">
//             <h3 className="text-sm text-muted-foreground">{m.title}</h3>
//             <p className="text-2xl font-semibold">{m.value}</p>
//             <span className={`text-xs ${m.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
//               {m.change} from last month
//             </span>
//           </Card>
//         ))}
//       </div>

//       {/* Chart Section */}
//       <Card className="p-4">
//         <h2 className="text-lg font-semibold mb-4">Transactions Overview</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip />
//             <Line type="monotone" dataKey="transactions" stroke="hsl(var(--primary))" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </Card>

//       {/* Recent Transactions */}
//       <Card className="p-4">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold">Recent Transactions</h2>
//           <Button asChild size="sm" variant="secondary">
//             <Link to="/transactions" className="inline-flex items-center gap-1">
//               View More <ArrowRight size={14} />
//             </Link>
//           </Button>
//         </div>

//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>ID</TableCell>
//               <TableCell>Merchant</TableCell>
//               <TableCell>Amount</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell>Date</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {recentTransactions.map((txn) => (
//               <TableRow key={txn.id}>
//                 <TableCell>{txn.id}</TableCell>
//                 <TableCell>{txn.merchant}</TableCell>
//                 <TableCell>{txn.amount}</TableCell>
//                 <TableCell>
//                   <span
//                     className={`px-2 py-1 rounded text-xs ${
//                       txn.status === "Success"
//                         ? "bg-green-100 text-green-700"
//                         : txn.status === "Failed"
//                         ? "bg-red-100 text-red-700"
//                         : "bg-yellow-100 text-yellow-700"
//                     }`}
//                   >
//                     {txn.status}
//                   </span>
//                 </TableCell>
//                 <TableCell>{txn.date}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Card>
//     </div>
//   );
// }
