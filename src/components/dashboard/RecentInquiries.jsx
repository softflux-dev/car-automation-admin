import { useMemo, useState } from "react";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import DataTable from "@/components/table/DataTable";

const mockInquiries = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    service: "Auto detailing",
    date: "15/03/2024",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    service: "Boot detailing",
    date: "15/03/2024",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "mbrown@example.com",
    service: "2 wielers detailing",
    date: "15/03/2024",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    service: "Auto detailing",
    date: "15/03/2024",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "dwilson@example.com",
    service: "Boot detailing",
    date: "15/03/2024",
  },
];

export default function RecentInquiries() {
  const allServicesTextClassName =
    "text-subtitle focus:text-subtitle data-[state=checked]:text-subtitle";
  const [date, setDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filteredInquiries = useMemo(() => {
    return mockInquiries.filter((inquiry) => {
      const matchesSearch =
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.service.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesService =
        serviceFilter === "all" || inquiry.service === serviceFilter;

      const matchesDate = !date || inquiry.date === format(date, "dd/MM/yyyy");

      return matchesSearch && matchesService && matchesDate;
    });
  }, [date, searchTerm, serviceFilter]);

  const totalItems = filteredInquiries.length;
  const paginatedInquiries = filteredInquiries.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const columns = [
    {
      key: "name",
      label: "Naam",
      cellClassName: "font-medium text-[var(--title)]",
    },
    {
      key: "email",
      label: "E-mailadres",
    },
    {
      key: "service",
      label: "Dienst Type",
    },
    {
      key: "date",
      label: "Datum",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtitle" />
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Zoek aanvragen, klanten..."
            className="h-11 w-full rounded-xl border border-border/60 bg-white pl-9 shadow-sm"
          />
        </div>

        <div className="flex w-full flex-col gap-4 sm:flex-row xl:ml-auto xl:w-auto">
          <Select
            value={serviceFilter}
            onValueChange={(value) => {
              setServiceFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger
              className={`h-11 w-full rounded-xl border border-border/60 bg-white shadow-sm sm:w-[220px] ${serviceFilter === "all" ? "text-subtitle" : "text-[var(--title)]"}`}
            >
              <SelectValue placeholder="Alle Diensten" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className={allServicesTextClassName}>
                Alle Diensten
              </SelectItem>
              <SelectItem value="Auto detailing">Auto detailing</SelectItem>
              <SelectItem value="Boot detailing">Boot detailing</SelectItem>
              <SelectItem value="2 wielers detailing">
                2 wielers detailing
              </SelectItem>
            </SelectContent>
          </Select>

          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex h-11 min-w-[160px] items-center justify-between gap-2 rounded-xl border border-border/60 bg-white px-4 text-sm text-subtitle shadow-sm transition-colors hover:text-title">
                {date ? format(date, "dd/MM/yyyy") : "Kies datum"}
                <CalendarIcon className="h-4 w-4 text-subtitle" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setPage(1);
                  if (selectedDate) setDatePopoverOpen(false);
                }}
                className="rounded-md"
              />
              <div className="flex justify-end border-t border-border/60 bg-muted px-3 py-2">
                <button
                  type="button"
                  className="rounded-md px-3 py-1 text-sm font-medium text-title transition hover:bg-muted hover:text-title"
                  onClick={() => {
                    setDate(null);
                    setPage(1);
                    setDatePopoverOpen(false);
                  }}
                >
                  Wissen
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedInquiries}
        emptyMessage="Geen aanvragen gevonden voor deze filters."
        pagination={{
          page,
          pageSize: perPage,
          total: totalItems,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
