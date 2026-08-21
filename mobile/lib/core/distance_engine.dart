import 'dart:math' as math;

class DistanceEngine {
  static const double earthRadiusKm = 6371.0;

  static double calculateHaversineDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    if (lat1 == 0 && lon1 == 0) return 0.0;
    if (lat2 == 0 && lon2 == 0) return 0.0;

    final dLat = _degToRad(lat2 - lat1);
    final dLon = _degToRad(lon2 - lon1);

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_degToRad(lat1)) *
            math.cos(_degToRad(lat2)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);

    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    final distance = earthRadiusKm * c;

    return double.parse(distance.toStringAsFixed(1));
  }

  static int calculateTravelTimeMinutes(double distanceKm, {String mode = 'emergency'}) {
    if (distanceKm <= 0) return 5;
    // Average speeds in urban emergency conditions (km/h)
    double speedKmH = 45.0;
    if (mode == 'emergency') {
      speedKmH = 60.0;
    } else if (mode == 'walking') {
      speedKmH = 5.0;
    }

    final hours = distanceKm / speedKmH;
    final mins = (hours * 60).round();
    return math.max(mins, 3); // Minimum 3 minutes
  }

  static String formatDistance(double? distanceKm) {
    if (distanceKm == null || distanceKm == 0) return 'Nearby';
    if (distanceKm < 1.0) {
      return '${(distanceKm * 1000).round()} m';
    }
    return '$distanceKm km';
  }

  static String formatTravelTime(int? minutes) {
    if (minutes == null || minutes <= 0) return '~10 mins';
    if (minutes < 60) {
      return '~$minutes mins';
    }
    final hours = minutes ~/ 60;
    final remainingMins = minutes % 60;
    return remainingMins > 0 ? '~$hours hr $remainingMins min' : '~$hours hr';
  }

  static double _degToRad(double deg) {
    return deg * (math.pi / 180.0);
  }
}
