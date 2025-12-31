import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { checkBanStatus } from "@/utils/ban-check";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, MessageSquare, Flag, Star } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { ImageCarousel } from "@/components/image-carousel";
import { BackButton } from "@/components/back-button";
import { getSellerRating } from "@/app/reviews/actions";
import { ReportModal } from "@/components/report-modal";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await checkBanStatus();

  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch listing details
  const { data: listing, error } = await supabase
    .from("items")
    .select(
      `
      *,
      seller:profiles!seller_id(id, full_name, campus, mobile_number)
    `
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Check if user has favorited this listing
  const { data: favorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_id", id)
    .single();

  const isFavorited = !!favorite;

  // Fetch seller rating
  const { averageRating, totalReviews } = await getSellerRating(
    listing.seller.id
  );

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `RM ${price.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwnListing = listing.seller_id === user.id;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <main className="container relative z-10 mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Mobile Layout - Shows only on screens < lg */}
        <div className="flex flex-col gap-4 lg:hidden">
          {/* Mobile: Image Carousel */}
          <Card className="shadow-lg isolate">
            <CardContent className="p-0">
              <ImageCarousel images={listing.images} alt={listing.title} />
            </CardContent>
          </Card>

          {/* Mobile: Combined Title/Price/Description Card */}
          <Card className="shadow-lg isolate">
            <CardContent className="p-6 space-y-4">
              {/* Title */}
              <h1 className="text-3xl font-bold text-balance">
                {listing.title}
              </h1>

              {/* Price */}
              <p className="text-2xl font-bold text-primary">
                {formatPrice(listing.price)}
              </p>

              {/* Condition & Category Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{listing.condition}</Badge>
                {listing.category && (
                  <Badge variant="secondary">{listing.category}</Badge>
                )}
                {listing.status === "sold" && (
                  <Badge variant="destructive">SOLD</Badge>
                )}
              </div>

              {/* Preferred Meetup Area */}
              {listing.meetup_area && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.meetup_area}</span>
                </div>
              )}

              {/* Description */}
              <div className="pt-2">
                <h2 className="mb-3 text-lg font-bold">Description</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {listing.description}
                </p>
              </div>

              {/* Post Date */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
                <Calendar className="h-4 w-4" />
                <span>Posted on {formatDate(listing.created_at)}</span>
              </div>

              {/* Action Buttons - For Non-Owners */}
              {!isOwnListing && listing.status !== "sold" && (
                <div className="space-y-3 pt-4">
                  {/* Chat with Seller */}
                  <Button
                    asChild
                    className="w-full bg-[#00dee8] hover:bg-[#00dee8] text-black font-semibold
                      shadow-lg
                      hover:shadow-[0_0_10px_rgba(0,222,232,0.5)] 
                      hover:scale-[1.02] transition-all duration-100"
                    size="lg"
                  >
                    <Link
                      href={`/chat/start?itemId=${listing.id}`}
                      prefetch={false}
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Chat with Seller
                    </Link>
                  </Button>

                  {/* Favorite and Report - Side by Side */}
                  <div className="flex gap-3">
                    {/* Add to Favorites - Larger */}
                    <div className="flex-3">
                      <FavoriteButton
                        itemId={listing.id}
                        initialFavorited={isFavorited}
                      />
                    </div>

                    {/* Report - Smaller */}
                    <div className="flex-2">
                      <ReportModal
                        type="listing"
                        id={listing.id}
                        name={listing.title}
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600 hover:scale-[1.02] transition-all duration-200"
                          >
                            <Flag className="mr-2 h-5 w-5" />
                            Report
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Button - For Owners */}
              {isOwnListing && (
                <div className="pt-4">
                  <Button
                    asChild
                    className="w-full border-2 border-[#00dee8] dark:hover:border-[#00dee8] text-[#00dee8] hover:bg-[#00dee8] dark:hover:bg-[#00dee8] hover:text-black font-semibold shadow-md hover:shadow-lg hover:shadow-[#00dee8]/20 dark:hover:shadow-[#00dee8]/20 hover:scale-[1.02] transition-all duration-100"
                    variant="outline"
                    size="lg"
                  >
                    <Link href={`/sell?edit=${listing.id}`}>Edit Listing</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile: Seller Info */}
          <Card className="shadow-lg isolate">
            <CardContent className="px-3 py-2">
              <h3 className="mb-2 font-bold">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {listing.seller.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{listing.seller.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {listing.seller.campus} Campus
                  </p>
                  {listing.show_contact_info && listing.seller.mobile_number && (
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-1">
                      📞 {listing.seller.mobile_number}
                    </p>
                  )}
                  {/* Seller Rating */}
                  {totalReviews > 0 ? (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.round(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {averageRating.toFixed(1)} ({totalReviews}{" "}
                        {totalReviews === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      No reviews yet
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Layout - Shows only on screens >= lg */}
        <div className="hidden lg:grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg isolate">
              <CardContent className="p-0">
                <ImageCarousel images={listing.images} alt={listing.title} />
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mt-6 shadow-lg isolate">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Description</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <Card className="shadow-lg isolate">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-balance mb-2">
                    {listing.title}
                  </h1>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(listing.price)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{listing.condition}</Badge>
                  {listing.category && (
                    <Badge variant="secondary">{listing.category}</Badge>
                  )}
                  {listing.status === "sold" && (
                    <Badge variant="destructive">SOLD</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {listing.meetup_area && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.meetup_area}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Posted on {formatDate(listing.created_at)}</span>
                  </div>
                </div>

                {!isOwnListing && listing.status !== "sold" && (
                  <div className="space-y-3 pt-4">
                    <Button
                      asChild
                      className="w-full bg-[#00dee8] hover:bg-[#00dee8] text-black font-semibold
                        shadow-lg
                        hover:shadow-[0_0_10px_rgba(0,222,232,0.5)] 
                        hover:scale-[1.02] transition-all duration-100"
                      size="lg"
                    >
                      <Link
                        href={`/chat/start?itemId=${listing.id}`}
                        prefetch={false}
                      >
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Chat with Seller
                      </Link>
                    </Button>
                    <FavoriteButton
                      itemId={listing.id}
                      initialFavorited={isFavorited}
                    />

                    {/* Report Button */}
                    <ReportModal
                      type="listing"
                      id={listing.id}
                      name={listing.title}
                      trigger={
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="w-full mt-6 border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600 hover:scale-[1.02] transition-all duration-200"
                        >
                          <Flag className="mr-2 h-5 w-5" />
                          Report Listing
                        </Button>
                      }
                    />
                  </div>
                )}

                {isOwnListing && (
                  <div className="space-y-3 pt-4">
                    <Button
                      asChild
                      className="w-full border-2 border-[#00dee8] dark:hover:border-[#00dee8] text-[#00dee8] hover:bg-[#00dee8] dark:hover:bg-[#00dee8] hover:text-black font-semibold shadow-md hover:shadow-lg hover:shadow-[#00dee8]/20 dark:hover:shadow-[#00dee8]/20 hover:scale-[1.02] transition-all duration-100"
                      variant="outline"
                      size="lg"
                    >
                      <Link href={`/sell?edit=${listing.id}`}>
                        Edit Listing
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="shadow-lg isolate">
              <CardContent className="p-6">
                <h3 className="mb-4 font-bold">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {listing.seller.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{listing.seller.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.seller.campus} Campus
                    </p>
                    {listing.show_contact_info && listing.seller.mobile_number && (
                      <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-1">
                        📞 {listing.seller.mobile_number}
                      </p>
                    )}
                    {/* Seller Rating */}
                    {totalReviews > 0 ? (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(averageRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {averageRating.toFixed(1)} ({totalReviews}{" "}
                          {totalReviews === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        No reviews yet
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
