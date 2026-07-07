import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const SUCCESS_COPY = {
  publish: "Published",
  unpublish: "Moved to draft",
  archive: "Archived",
  schedule: "Scheduled",
};

export function usePublishingActions(publishingApi, invalidateKeys) {
  const queryClient = useQueryClient();

  const handleTransition = async (item, action, payload) => {
    try {
      if (action === "schedule") {
        await publishingApi.schedule(item.id, payload);
      } else {
        await publishingApi[action](item.id);
      }
      toast.success(SUCCESS_COPY[action] || "Updated");
      invalidateKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't update — try again");
    }
  };

  return { handleTransition };
}
