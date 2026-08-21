class UserModel {
  final String id;
  final String name;
  final String email;
  final String role; // 'donor' | 'hospital' | 'admin'
  final String? profileId;
  final String? bloodGroup;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.profileId,
    this.bloodGroup,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? json['user_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'User',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'donor',
      profileId: json['profile_id']?.toString() ?? json['profileId']?.toString(),
      bloodGroup: json['blood_group']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'profile_id': profileId,
      'blood_group': bloodGroup,
    };
  }
}
