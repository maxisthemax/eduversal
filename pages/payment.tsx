import prisma from "@/lib/prisma";
import { GetServerSideProps } from "next";
import qs from "querystring";
import { useRouter } from "next/navigation";

//*lodash
import reduce from "lodash/reduce";
import some from "lodash/some";

//*mui
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

function Payment({
  orderId,
  status,
  message,
}: {
  orderId?: string;
  status?: string;
  message?: string;
}) {
  const { push } = useRouter();

  if (status === "SUCCESS") {
    return (
      <Dialog
        open={Boolean(orderId)}
        disableEscapeKeyDown={true}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
            }}
            spacing={3}
          >
            <Typography variant="h5">
              <b>Payment Successful</b>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: "break-spaces" }}
            >
              {
                "Your payment has been processed successfully.\nYou can now view your order details and\ndownload any purchased items."
              }
            </Typography>
            <Button
              size="large"
              variant="contained"
              onClick={() => {
                push(
                  `${process.env.NEXT_PUBLIC_URL}/account/purchase?orderId=` +
                    orderId
                );
              }}
            >
              View Order Details
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  } else
    return (
      <Dialog
        open={Boolean(orderId)}
        disableEscapeKeyDown={true}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
            }}
            spacing={3}
          >
            <Box>
              <Typography variant="h5" gutterBottom>
                <b>Payment Failed</b>
              </Typography>
              <Typography variant="body1" color="error">
                {message}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {
                "Your payment was not successful.\nPlease try again or contact support for assistance."
              }
            </Typography>
            <Button
              size="large"
              variant="contained"
              onClick={() => {
                if (orderId) {
                  push(
                    `${process.env.NEXT_PUBLIC_URL}/account/purchase?orderId=` +
                      orderId
                  );
                } else push(`${process.env.NEXT_PUBLIC_URL}/account/purchase`);
              }}
            >
              Back To Order
            </Button>
          </Stack>
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
        props: { status: "FAILED", message: "No data received" },
      };
    }

    const formData = qs.parse(rawBody);

    const findOrder = await prisma.order.findFirst({
      where: { order_no: Number(formData.OrderNumber) },
    });

    const payment = await prisma.payment.findFirst({
      where: { payment_id: formData.PaymentID as string },
    });

    if (!payment?.id) {
      return {
        props: {
          orderId: findOrder.id,
          status: "FAILED",
          message: "Payment not found",
        },
      };
    }

    if (formData.TxnStatus === "0") {
      await prisma.$transaction(async (prisma) => {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { payment_detail: formData, updated_at: new Date() },
        });

        const order = await prisma.order.update({
          where: { order_no: Number(formData.OrderNumber) },
          data: {
            status: "COMPLETED",
            success_payment_id: payment.id,
            transaction_no: formData.TxnID as string,
          },
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
    } else if (formData.TxnStatus === "1") {
      await prisma.$transaction(async (prisma) => {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { payment_detail: formData, updated_at: new Date() },
        });
      });
    }

    // Pass to your page as props
    return {
      props: {
        orderId: findOrder.id,
        status: { "0": "SUCCESS", "1": "FAILED" }[formData.TxnStatus as string],
        message: {
          "0": "Payment Successful",
          "1": "Transaction failed",
        }[formData.TxnStatus as string],
      },
    };
  } else {
    return {
      props: {
        status: "FAILED",
        message: "Invalid request method",
      },
    };
  }
};
