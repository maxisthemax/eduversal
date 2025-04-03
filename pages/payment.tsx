import prisma from "@/lib/prisma";
import { GetServerSideProps } from "next";
import qs from "querystring";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

//*lodash
import reduce from "lodash/reduce";
import some from "lodash/some";

//*mui
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

function Payment({ orderId }: { orderId: string }) {
  const { push } = useRouter();

  useEffect(() => {
    if (orderId) {
      push("http://localhost:5000/account/purchase?orderId=" + orderId);
    } else push("http://localhost:5000/account/purchase");
  }, [orderId]);

  return (
    <Dialog open={Boolean(orderId)} disableEscapeKeyDown={true}>
      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            my: 4,
          }}
        >
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h6" sx={{ mt: 4 }}>
            Processing Payment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please do not close this window. You will be redirected to the
            payment gateway...
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default Payment;

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.req.method === "POST") {
    const rawBody = await new Promise<string>((resolve, reject) => {
      let data = "";
      context.req.on("data", (chunk) => (data += chunk));
      context.req.on("end", () => resolve(data));
      context.req.on("error", (err) => reject(err));
    });

    if (!rawBody) {
      return {
        props: {},
      };
    }

    const formData = qs.parse(rawBody);

    const findOrder = await prisma.order.findFirst({
      where: { order_no: Number(formData.OrderNumber) },
    });

    if (formData.TxnStatus === "0") {
      await prisma.$transaction(async (prisma) => {
        const payment = await prisma.payment.findFirst({
          where: { hashValue: formData.hashValue as string },
        });

        if (!payment) {
          return {
            props: { orderId: findOrder.id },
          };
        }

        await prisma.payment.update({
          where: { id: payment.id },
          data: { payment_detail: formData, updated_at: new Date() },
        });

        const order = await prisma.order.update({
          where: { order_no: Number(formData.OrderNumber) },
          data: { status: "COMPLETED" },
        });

        const allDownloadable = reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order.cart as any,
          (temp, value) => {
            if (value.userPackage.packageId === "none") {
              if (
                some(value.userPackage.items[0].productVariationOptions, {
                  productVariationDownloadable: true,
                })
              ) {
                temp.push({
                  photoId: value.userPackage.items[0].photoId,
                  photoUrl: value.userPackage.items[0].photoUrl,
                  photoName: value.userPackage.items[0].photoName,
                  downloadUrl: value.userPackage.items[0].downloadUrl,
                });
              }
            } else {
              if (value.userPackage.packageData.is_downloadable) {
                const images = value.userPackage.items.map((item) => {
                  return {
                    photoId: item.photoId,
                    photoUrl: item.photoUrl,
                    photoName: item.photoName,
                    downloadUrl: item.downloadUrl,
                  };
                });
                temp.push(...images);
              } else {
                value.userPackage.items.forEach((item) => {
                  if (
                    some(item.productVariationOptions, {
                      productVariationDownloadable: true,
                    })
                  ) {
                    temp.push({
                      photoId: item.photoId,
                      photoUrl: item.photoUrl,
                      photoName: item.photoName,
                      downloadUrl: item.downloadUrl,
                    });
                  }
                });
              }
            }

            return temp;
          },
          []
        );

        await prisma.user.update({
          where: { id: order.user_id },
          data: {
            download_images: allDownloadable,
          },
        });
      });
    }

    // Pass to your page as props
    return {
      props: { orderId: findOrder.id },
    };
  } else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
